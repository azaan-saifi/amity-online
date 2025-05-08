import { Schema, model, models, Document } from "mongoose";

export interface ISystemSettings extends Document {
  key: string;
  value: string;
  updatedAt: Date;
}

const SystemSettingsSchema = new Schema<ISystemSettings>({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  value: {
    type: String,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const SystemSettings =
  models.SystemSettings || model("SystemSettings", SystemSettingsSchema);

export default SystemSettings;
