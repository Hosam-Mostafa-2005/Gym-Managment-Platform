// src/features/body-measurements/components/form/MeasurementForm.tsx
import React, { useState } from "react";
import { BasicMeasurementsFields } from "./BasicMeasurementsFields";
import { CircumferenceFields } from "./CircumferenceFields";
import { MeasurementNotes } from "./MeasurementNotes";

export interface MeasurementFormPayload {
  weight: number;
  height: number;
  bodyFat?: number;
  circumferences?: Record<string, number>;
  notes?: string;
  measuredAt?: string;
}

interface MeasurementFormProps {
  initialValues?: any;
  onSubmit: (data: MeasurementFormPayload) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

export const MeasurementForm: React.FC<MeasurementFormProps> = ({
  initialValues,
  onSubmit,
  isSubmitting,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    weight: initialValues?.weight || "",
    height: initialValues?.height || "",
    bodyFat: initialValues?.bodyFat || "",
    measuredAt: initialValues?.measuredAt
      ? new Date(initialValues.measuredAt).toISOString().slice(0, 16)
      : "",
    notes: initialValues?.notes || "",
  });

  const [circumferences, setCircumferences] = useState<Record<string, string>>(
    initialValues?.circumferences || {},
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCircumferenceChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setCircumferences({ ...circumferences, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    console.log("🔥 FORM SUBMIT FIRED", {
      formData,
      isSubmitting,
    });
    e.preventDefault();
    const payload: MeasurementFormPayload = {
      weight: parseFloat(formData.weight),
      height: parseFloat(formData.height),
    };
    if (formData.bodyFat) payload.bodyFat = parseFloat(formData.bodyFat);
    if (formData.measuredAt)
      payload.measuredAt = new Date(formData.measuredAt).toISOString();
    if (formData.notes) payload.notes = formData.notes;

    const parsedCircumferences: Record<string, number> = {};
    Object.keys(circumferences).forEach((key) => {
      if (circumferences[key] !== "" && circumferences[key] !== undefined) {
        parsedCircumferences[key] = parseFloat(circumferences[key]);
      }
    });

    if (Object.keys(parsedCircumferences).length > 0) {
      payload.circumferences = parsedCircumferences;
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <BasicMeasurementsFields
        formData={formData}
        handleChange={handleChange}
      />
      <CircumferenceFields
        circumferences={circumferences}
        handleCircumferenceChange={handleCircumferenceChange}
      />
      <MeasurementNotes value={formData.notes} onChange={handleChange} />

      <div className="mt-4 flex justify-end gap-3 border-t border-[#1E2329] pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-[#1E2329] bg-[#090B0F] px-4 py-2 text-xs font-medium text-gray-300 transition-colors hover:bg-[#1E2329] disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !formData.weight || !formData.height}
          className="rounded-md bg-[#5BE584] px-4 py-2 text-xs font-semibold text-[#090B0F] transition-colors hover:bg-[#4ade80] disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Measurement"}
        </button>
      </div>
    </form>
  );
};
