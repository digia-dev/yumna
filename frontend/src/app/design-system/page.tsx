"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { FinancialAreaChart } from "@/components/ui/financial-chart"
import { LegacyTimeline } from "@/components/ui/legacy-timeline"
import { EmptyState } from "@/components/ui/empty-state"
import { PageHeader } from "@/components/layout/page-header"

const mockChartData = [
  { name: "Jan", total: 2000000 },
  { name: "Feb", total: 4500000 },
  { name: "Mar", total: 3200000 },
  { name: "Apr", total: 5800000 },
]

const mockTimeline = [
  { id: "1", title: "Tabungan Haji", description: "Mulai menabung untuk Haji 2030", isCompleted: true, date: "Jan 2026" },
  { id: "2", title: "Dana Darurat 3 Bulan", description: "Target tercapai 75%", isCompleted: false, isCurrent: true, date: "Mar 2026" },
  { id: "3", title: "Beli Rumah Baru", description: "Target DP 20%", isCompleted: false },
]

export default function DesignSystemPage() {
  return (
    <div className="container mx-auto space-y-12 py-12 px-6">
      <PageHeader 
        title="Yumna Design System" 
        description="Preview komponen atmosferik dan infrastruktur UI untuk Yumna." 
      />

      <section className="space-y-6">
        <h2 className="text-xl font-bold font-display border-b pb-2">Buttons & Badges</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="premium">Bismillah (Premium)</Button>
          <Button variant="outline">Secondary Action</Button>
          <Button variant="ghost">Minimal</Button>
          <Badge variant="emerald">Terverifikasi</Badge>
          <Badge variant="gold">Premium</Badge>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-bold font-display border-b pb-2">Financial Charts</h2>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Aliran Kas Keluarga</CardTitle>
          </CardHeader>
          <CardContent>
            <FinancialAreaChart data={mockChartData} />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-bold font-display border-b pb-2">Legacy Timeline</h2>
        <Card>
          <CardContent className="pt-6">
            <LegacyTimeline items={mockTimeline} />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-bold font-display border-b pb-2">Empty States</h2>
        <EmptyState 
          type="wallet"
          title="Belum Ada Dompet"
          description="Silakan tambahkan dompet pertama Anda untuk mulai mengelola amanah harta."
          actionLabel="Tambah Dompet"
        />
      </section>
    </div>
  )
}
