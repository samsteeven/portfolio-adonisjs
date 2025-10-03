import { Card } from '@/components/ui/card'
import { ArrowRight, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
export const IsRestricted = ({
  message,
  isRestricted = true,
}: {
  message: string
  isRestricted?: boolean
}) => {
  if (!isRestricted) return null
  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès restreint</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Button>
              Visiter d'autres
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Card>
        </div>
      </div>
    </>
  )
}
