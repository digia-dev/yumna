'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Home } from 'lucide-react'
import { OnboardingProgress } from '@/components/onboarding/onboarding-progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthLayout } from '@/components/auth/auth-layout'

export default function CreateFamilyPage() {
  const [familyName, setFamilyName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!familyName) return

    setIsLoading(true)
    try {
      // In production, this would call the API to create family
      // For now, we simulate success and redirect
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast.success('Keluarga berhasil dibentuk! Selamat datang di Yumna.')
      router.push('/dashboard')
    } catch {
      toast.error('Gagal membentuk keluarga. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Bentuk Keluarga Digital"
      subtitle="Beri nama untuk identitas finansial keluarga Anda"
    >
      <OnboardingProgress currentStep={3} />
      <form onSubmit={handleCreate} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="familyName">Nama Keluarga</Label>
          <div className="relative">
            <Input
              id="familyName"
              placeholder="Contoh: Keluarga Ahmad"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              className="pl-10"
              required
              disabled={isLoading}
            />
            <Home
              className="text-muted-foreground absolute top-2.5 left-3"
              size={18}
            />
          </div>
          <p className="text-muted-foreground text-[10px] italic">
            *Nama ini akan muncul di dashboard dan laporan bersama.
          </p>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={!familyName || isLoading}
        >
          {isLoading ? 'Membentuk Keluarga...' : 'Bangun Pondasi Sekarang'}
        </Button>
      </form>
    </AuthLayout>
  )
}
