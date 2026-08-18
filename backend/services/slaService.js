/**
 * SLA (Service Level Agreement) Escalation Service — CivicWatch
 *
 * Runs every 60 minutes and automatically escalates issues that have
 * exceeded their SLA deadline without being resolved.
 *
 * SLA Deadlines by Priority:
 *   urgent  → 1 day
 *   high    → 3 days
 *   medium  → 7 days
 *   low     → 10 days
 *
 * On breach:
 *   - escalated = true
 *   - priority upgraded one level (low → medium → high → urgent)
 *   - slaDeadline updated to the new priority's deadline from today
 *   - statusHistory entry added
 *   - Socket.io 'slaEscalated' event emitted to global room
 */

const Issue = require('../models/Issue');

// SLA windows in milliseconds
const SLA_LIMITS_MS = {
  urgent: 1 * 24 * 60 * 60 * 1000,   // 1 day
  high:   3 * 24 * 60 * 60 * 1000,   // 3 days
  medium: 7 * 24 * 60 * 60 * 1000,   // 7 days
  low:    10 * 24 * 60 * 60 * 1000,  // 10 days
};

const SLA_DAYS = { urgent: 1, high: 3, medium: 7, low: 10 };

// Priority escalation ladder
const ESCALATION_MAP = {
  low:    'medium',
  medium: 'high',
  high:   'urgent',
  urgent: 'urgent', // already at max
};

/**
 * Compute the SLA deadline Date from creation time and priority
 */
const computeSlaDeadline = (createdAt, priority) => {
  const ms = SLA_LIMITS_MS[priority] || SLA_LIMITS_MS.medium;
  return new Date(new Date(createdAt).getTime() + ms);
};

/**
 * Run the SLA check — finds breached issues and escalates them.
 * @param {Server} io  - Socket.io server instance
 */
const runSlaCheck = async (io) => {
  try {
    const now = new Date();
    console.log(`[SLA] Running SLA check at ${now.toISOString()}`);

    // Find non-resolved issues whose slaDeadline has passed
    const overdueIssues = await Issue.find({
      status: { $in: ['pending', 'in_progress'] },
      slaDeadline: { $lt: now },
    });

    if (overdueIssues.length === 0) {
      console.log('[SLA] No overdue issues found.');
      return;
    }

    console.log(`[SLA] Found ${overdueIssues.length} overdue issue(s). Escalating...`);

    for (const issue of overdueIssues) {
      const oldPriority = issue.priority || 'medium';
      const newPriority = ESCALATION_MAP[oldPriority];

      // Mark as escalated
      issue.escalated = true;
      issue.priority  = newPriority;

      // Extend the slaDeadline forward from today based on new priority
      issue.slaDeadline = computeSlaDeadline(now, newPriority);

      // Record in status history (no auth user — use a system marker)
      issue.statusHistory.push({
        status: issue.status,
        updatedBy: issue.reportedBy, // closest available user ref
        comment: `⚠️ SLA Breached — Issue auto-escalated from ${oldPriority.toUpperCase()} to ${newPriority.toUpperCase()} by system. New deadline: ${SLA_DAYS[newPriority]} day(s) from today.`,
        timestamp: now,
      });

      await issue.save();

      console.log(`[SLA] Escalated issue "${issue.title}" (${issue._id}): ${oldPriority} → ${newPriority}`);

      // Emit real-time Socket.io event to admin global room
      if (io) {
        io.to('global').emit('slaEscalated', {
          issueId:     issue._id,
          issueTitle:  issue.title,
          oldPriority,
          newPriority,
          status:      issue.status,
          slaDeadline: issue.slaDeadline,
          location:    issue.location?.address,
          escalatedAt: now,
        });
      }
    }

    console.log(`[SLA] Check complete. ${overdueIssues.length} issue(s) escalated.`);
  } catch (err) {
    console.error('[SLA] Error during SLA check:', err.message);
  }
};

/**
 * Start the SLA background job.
 * Also patches existing issues without a slaDeadline on first run.
 * @param {Server} io  - Socket.io server instance
 * @param {number} intervalMs - How often to run (default: 60 minutes)
 */
const startSlaService = async (io, intervalMs = 60 * 60 * 1000) => {
  console.log('[SLA] SLA Escalation Service starting...');

  // Patch existing issues that have no slaDeadline set yet
  try {
    const unpatchedIssues = await Issue.find({
      slaDeadline: null,
      status: { $in: ['pending', 'in_progress'] },
    });

    for (const issue of unpatchedIssues) {
      issue.slaDeadline = computeSlaDeadline(issue.createdAt, issue.priority || 'medium');
      await issue.save();
    }

    if (unpatchedIssues.length > 0) {
      console.log(`[SLA] Patched ${unpatchedIssues.length} existing issue(s) with SLA deadlines.`);
    }
  } catch (err) {
    console.error('[SLA] Failed to patch existing issues:', err.message);
  }

  // Run once immediately on startup
  await runSlaCheck(io);

  // Then schedule recurring checks
  const intervalId = setInterval(() => runSlaCheck(io), intervalMs);
  console.log(`[SLA] Service running — checks every ${intervalMs / 60000} minute(s).`);

  return intervalId;
};

module.exports = { startSlaService, computeSlaDeadline, SLA_DAYS, SLA_LIMITS_MS };
