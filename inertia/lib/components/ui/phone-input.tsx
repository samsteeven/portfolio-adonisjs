'use client'

import * as React from 'react'
import { useState, useRef, useEffect } from 'react'
import * as RPNInput from 'react-phone-number-input'
import flags from 'react-phone-number-input/flags'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CheckIcon, ChevronsUpDown } from 'lucide-react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { cn } from '~/lib/utils'

type PhoneInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value' | 'ref'
> &
  Omit<RPNInput.Props<typeof RPNInput.default>, 'onChange' | 'value'> & {
    onChange?: (value: string) => void
    value?: string
  }

const PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps> = React.forwardRef<
  React.ElementRef<typeof RPNInput.default>,
  PhoneInputProps
>(({ className, onChange, value, ...props }, ref) => {
  return (
    <RPNInput.default
      ref={ref}
      className={cn('flex', className)}
      flagComponent={FlagComponent}
      countrySelectComponent={CountrySelect}
      inputComponent={InputComponent}
      smartCaret={false}
      value={value || undefined}
      /**
       * Handles the onChange event.
       *
       * react-phone-number-input might trigger the onChange event as undefined
       * when a valid phone number is not entered. To prevent this,
       * the value is coerced to an empty string.
       *
       * @param {E164Number | undefined} value - The entered value
       */
      onChange={(value) => onChange?.(value || ('' as RPNInput.Value))}
      {...props}
    />
  )
})
PhoneInput.displayName = 'PhoneInput'

const InputComponent = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, ...props }, ref) => (
    <Input 
      className={cn(
        'rounded-e-lg rounded-s-none focus-visible:ring-pink-500 focus-visible:border-pink-500',
        className
      )} 
      {...props} 
      ref={ref} 
    />
  )
)
InputComponent.displayName = 'InputComponent'

type CountryEntry = { label: string; value: RPNInput.Country | undefined }

type CountrySelectProps = {
  disabled?: boolean
  value: RPNInput.Country
  options: CountryEntry[]
  onChange: (country: RPNInput.Country) => void
}

const CountrySelect = ({
  disabled,
  value,
  options,
  onChange,
}: CountrySelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <Button
        type="button"
        variant="outline"
        className="flex items-center gap-2 rounded-e-none rounded-s-lg px-3 h-10 bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
        disabled={disabled}
      >
        <ChevronsUpDown className="h-4 w-4 opacity-50" />
      </Button>
    )
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="flex items-center gap-2 rounded-e-none rounded-s-lg px-3 h-10 bg-gray-800 border-gray-700 text-white hover:bg-gray-700 focus-visible:ring-pink-500"
          disabled={disabled}
          ref={triggerRef}
        >
          <ChevronsUpDown className={cn('h-4 w-4 opacity-50', { 'opacity-100': isOpen })} />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[300px] p-0 bg-gray-800 border-gray-700" 
        align="start"
      >
        <Command className="bg-gray-800">
          <CommandInput 
            placeholder="Rechercher un pays..." 
            className="bg-gray-800 text-white placeholder-gray-400"
          />
          <CommandList className="max-h-[200px]">
            <CommandEmpty className="py-6 text-center text-sm text-gray-400">
              Aucun pays trouvé
            </CommandEmpty>
            <CommandGroup className="bg-gray-800">
              {options
                .filter((x) => x.value)
                .map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      onChange(option.value as RPNInput.Country)
                      setIsOpen(false)
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-white hover:bg-gray-700"
                  >
                    <FlagComponent
                      country={option.value as RPNInput.Country}
                      countryName={option.label}
                    />
                    <span className="flex-1 text-sm">{option.label}</span>
                    <span className="text-sm text-gray-400">
                      +{RPNInput.getCountryCallingCode(option.value as RPNInput.Country)}
                    </span>
                    {option.value === value && (
                      <CheckIcon className="h-4 w-4 text-pink-500" />
                    )}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country]

  return (
    <span className="flex h-4 w-6 overflow-hidden rounded-sm bg-gray-700 [&_svg]:size-full">
      {Flag ? <Flag title={countryName} /> : <span className="text-xs">?</span>}
    </span>
  )
}

export { PhoneInput }