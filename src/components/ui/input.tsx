import * as React from "react"
import PlacesAutocomplete from 'react-places-autocomplete';
import { useState } from 'react';

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export function AddressAutocomplete({ value, onChange, placeholder = 'Street Address', className = '', ...props }) {
  const [address, setAddress] = useState(value || '');

  const handleChange = (val: string) => {
    setAddress(val);
    onChange(val);
  };

  return (
    <PlacesAutocomplete value={address} onChange={handleChange} onSelect={handleChange} debounce={300}>
      {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
        <div className="relative">
          <input
            {...getInputProps({
              placeholder,
              className: `bg-lodge-dark-bg border-white/10 w-full ${className}`,
              ...props,
            })}
          />
          {suggestions.length > 0 && (
            <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded shadow-lg border border-gray-200 max-h-56 overflow-y-auto">
              {loading && <div className="p-2 text-gray-400">Loading...</div>}
              {suggestions.map(suggestion => (
                <div
                  {...getSuggestionItemProps(suggestion, {
                    className: `p-2 cursor-pointer hover:bg-lodge-purple/10 ${suggestion.active ? 'bg-lodge-purple/10' : ''}`,
                  })}
                  key={suggestion.placeId}
                >
                  {suggestion.description}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </PlacesAutocomplete>
  );
}

export { Input }
