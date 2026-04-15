import { Injectable } from '@nestjs/common';

@Injectable()
export class InheritanceService {
  /**
   * Simplified Faraid Logic
   */
  calculateInheritance(
    totalWealth: number,
    heirs: {
      hasHusband: boolean;
      hasWife: boolean;
      hasFather: boolean;
      hasMother: boolean;
      sons: number;
      daughters: number;
    },
  ) {
    const shares: Record<string, number> = {};
    let remaining = totalWealth;

    // 1. Fixed Shares (Fardhu)
    if (heirs.hasHusband) {
      const fraction = heirs.sons > 0 || heirs.daughters > 0 ? 0.25 : 0.5;
      shares['suami'] = totalWealth * fraction;
      remaining -= shares['suami'];
    }

    if (heirs.hasWife) {
      const fraction = heirs.sons > 0 || heirs.daughters > 0 ? 0.125 : 0.25;
      shares['istri'] = totalWealth * fraction;
      remaining -= shares['istri'];
    }

    if (heirs.hasFather) {
      const fraction = heirs.sons > 0 || heirs.daughters > 0 ? 1 / 6 : 1 / 6; // Father gets 1/6 + Asabah if no son, but we simplify
      shares['ayah'] = totalWealth * (1 / 6);
      remaining -= shares['ayah'];
    }

    if (heirs.hasMother) {
      const fraction = heirs.sons > 0 || heirs.daughters > 0 ? 1 / 6 : 1 / 3;
      shares['ibu'] = totalWealth * fraction;
      remaining -= shares['ibu'];
    }

    // 2. Residue (Asabah) - Sons and Daughters
    const totalChildrenParts = heirs.sons * 2 + heirs.daughters;
    if (totalChildrenParts > 0 && remaining > 0) {
      const partValue = remaining / totalChildrenParts;
      if (heirs.sons > 0) {
        shares['anak_laki'] = partValue * 2 * heirs.sons;
      }
      if (heirs.daughters > 0) {
        shares['anak_perempuan'] = partValue * heirs.daughters;
      }
      remaining = 0;
    }

    return {
      totalDistributed: totalWealth - remaining,
      shares,
      remaining: Math.max(0, remaining),
    };
  }
}
