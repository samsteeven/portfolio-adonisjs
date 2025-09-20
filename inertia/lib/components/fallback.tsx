import { Loader2 } from 'lucide-react'

export const Fallback = ({ message }: { message: string }) => {
  return (
    <div className="flex justify-center py-12">
      <div className="flex items-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
        <span className="text-gray-400">{`Chargement des ${message}...`}</span>
      </div>
    </div>
  )
}
