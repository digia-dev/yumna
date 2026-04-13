'use client'

import { AuthLayout } from '@/components/layout/auth-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Mail, Lock, LogIn } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      toast.error('Email atau kata sandi salah.')
      setIsLoading(false)
    } else {
      toast.success("Assalamu'alaikum! Senang melihat Anda kembali.")
      router.push('/dashboard')
    }
  }

  return (
    <AuthLayout
      title="Selamat Datang Kembali"
      subtitle="Masuk untuk mengelola keberkahan finansial keluarga Anda."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Alamat Email</Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
            <Mail
              className="text-muted-foreground absolute top-2.5 left-3"
              size={18}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Kata Sandi</Label>
            <Link
              href="/forgot-password"
              className="text-primary text-xs hover:underline"
            >
              Lupa sandi?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              required
            />
            <Lock
              className="text-muted-foreground absolute top-2.5 left-3"
              size={18}
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Memuat...' : 'Masuk Sekarang'}
          <LogIn size={18} className="ml-2" />
        </Button>

        <div className="flex items-center gap-2">
          <div className="h-px w-8 bg-border" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Atau</span>
          <div className="h-px w-8 bg-border" />
        </div>

        <Button
          variant="outline"
          className="border-muted-foreground/20 w-full"
          type="button"
        >
          <svg
            className="mr-2 h-4 w-4"
            aria-hidden="true"
            focusable="false"
            data-prefix="fab"
            data-icon="google"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
          >
            <path
              fill="currentColor"
              d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
            ></path>
          </svg>
          Masuk dengan Google
        </Button>

        <div className="text-center text-sm">
          Belum punya akun?{' '}
          <Link
            href="/register"
            className="text-primary font-bold hover:underline"
          >
            Daftar Gratis
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
