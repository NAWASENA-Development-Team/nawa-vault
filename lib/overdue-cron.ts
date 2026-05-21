import { db } from '@/db';
import { loans, auditLogs } from '@/db/schema';
import { eq, and, lt } from 'drizzle-orm';

// Intended to be hit by a cron job (e.g., Vercel Cron or GitHub Actions)
export async function checkOverdueLoans() {
  const now = new Date();
  
  const overdueRecords = await db.update(loans)
    .set({ status: 'overdue' })
    .where(
      and(
        eq(loans.status, 'active'),
        lt(loans.dueDate, now)
      )
    ).returning();

  for (const loan of overdueRecords) {
    await db.insert(auditLogs).values({
      action: 'loan_overdue_flagged',
      entityType: 'loan',
      entityId: loan.id,
      details: { loanCode: loan.loanCode, dueDate: loan.dueDate }
    });
  }
  
  return overdueRecords.length;
}