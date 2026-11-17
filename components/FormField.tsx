
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

import {
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "password";
}

const FormField = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text",
}: FormFieldProps<T>) => {
  const inputId = String(name);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={inputId} className="label">
            {label}
          </FieldLabel>

          <Input
            {...field}
            id={inputId}
            className="input"
            type={type}
            placeholder={placeholder}
            value={field.value ?? ""}
            aria-invalid={fieldState.invalid}
          />

          {fieldState.error?.message && (
            <FieldError>
              {fieldState.error.message}
            </FieldError>
          )}
        </Field>
      )}
    />
  );
};

export default FormField;
