"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const bcrypt = __importStar(require("bcrypt"));
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    const password = await bcrypt.hash('password123', 10);
    const family = await prisma.family.create({
        data: {
            name: 'Keluarga Sakinah',
        },
    });
    const ayah = await prisma.user.create({
        data: {
            email: 'ayah@yumna.com',
            password,
            name: 'Ayah Ahmad',
            role: client_1.UserRole.KEPALA_KELUARGA,
            familyId: family.id,
        },
    });
    const ibu = await prisma.user.create({
        data: {
            email: 'ibu@yumna.com',
            password,
            name: 'Ibu Fatimah',
            role: client_1.UserRole.ISTRI,
            familyId: family.id,
        },
    });
    const anak = await prisma.user.create({
        data: {
            email: 'anak@yumna.com',
            password,
            name: 'Anak Sholeh',
            role: client_1.UserRole.ANAK,
            familyId: family.id,
        },
    });
    const tabunganUtama = await prisma.wallet.create({
        data: {
            name: 'Tabungan Utama',
            balance: 15000000,
            userId: ayah.id,
            familyId: family.id,
        },
    });
    const dompetHarian = await prisma.wallet.create({
        data: {
            name: 'Dompet Harian',
            balance: 2000000,
            userId: ibu.id,
            familyId: family.id,
        },
    });
    await prisma.transaction.create({
        data: {
            amount: 500000,
            type: client_1.TransactionType.EXPENSE,
            category: 'Sedekah',
            description: 'Sedekah Jumat ke Masjid',
            userId: ayah.id,
            walletId: tabunganUtama.id,
            date: new Date(),
            metadata: { isZakat: false, impact: 'High' },
        },
    });
    await prisma.transaction.create({
        data: {
            amount: 100000,
            type: client_1.TransactionType.EXPENSE,
            category: 'Kebutuhan Pokok',
            description: 'Beli sayuran',
            userId: ibu.id,
            walletId: dompetHarian.id,
            date: new Date(),
        },
    });
    console.log('Seed data created successfully!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map