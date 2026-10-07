import { z } from 'zod';

// Zod schemas for clinical validation
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .refine((val) => /^[^\s@]+@[^\s@]+$/.test(val), {
      message: 'Please enter a valid email address',
    }),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;

export const STATUS_VALUES = [
  'scheduled',
  'completed',
  'active',
  'inactive',
  'cancelled',
  'pending',
  'failed',
] as const;

export const encounterSchema = z.object({
  patientId: z.string().min(1, 'Patient selection is required'),
  encounterDate: z.string().min(1, 'Encounter date is required'),
  symptoms: z.string().min(3, 'Symptoms must be at least 3 characters'),
  diagnosis: z.string().min(2, 'Diagnosis is required'),
  treatment: z.string().min(3, 'Treatment plan is required'),
  temperature: z
    .string()
    .min(1, 'Body temperature is required')
    .refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 90 && num <= 110;
      },
      { message: 'Temperature must be between 90°F and 110°F' }
    ),
  bloodPressure: z
    .string()
    .min(1, 'Blood pressure is required')
    .regex(
      /^\d{2,3}\/\d{2,3}$/,
      'Format must be Systolic/Diastolic (e.g., 120/80)'
    ),
  status: z.enum(STATUS_VALUES),
  notes: z.string().optional(),
});

export type EncounterSchemaType = z.infer<typeof encounterSchema>;

export const GENDER_VALUES = ['Male', 'Female', 'Other'] as const;
export const PATIENT_STATUS_VALUES = ['active', 'inactive'] as const;

export const patientSchema = z.object({
  name: z.string().min(2, 'Patient name must be at least 2 characters').max(100, 'Name is too long'),
  age: z
    .preprocess(
      (val) => (val === '' || val === undefined || (typeof val === 'number' && isNaN(val)) ? undefined : Number(val)),
      z.number({ required_error: 'Age is required', invalid_type_error: 'Age must be a valid number' })
    )
    .refine((val) => Number.isInteger(val), { message: 'Age must be a whole number' })
    .refine((val) => val >= 0 && val <= 130, { message: 'Age must be between 0 and 130' }),
  gender: z.enum(GENDER_VALUES, { errorMap: () => ({ message: 'Please select a gender' }) }),
  district: z.string().min(2, 'District / health center is required'),
  status: z.enum(PATIENT_STATUS_VALUES).default('active'),
});

export type PatientSchemaType = z.infer<typeof patientSchema>;
