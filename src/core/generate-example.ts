import {
  ZodDefault,
  ZodObject,
  ZodOptional,
  type ZodRawShape,
  ZodString,
  ZodNumber,
  ZodBoolean,
} from "zod";
import fs from "fs";

function getZodTypeName(schema: ZodObject): string {
  let type = "unknown";

  if (schema instanceof ZodString) type = "string";
  else if (schema instanceof ZodNumber) type = "number";
  else if (schema instanceof ZodBoolean) type = "boolean";

  return type;
}

export function generateExample<T extends ZodRawShape>(
  schema: ZodObject<T>,
  path = ".env.example",
) {
  const header = [
    "# Example environment variables",
    "# Copy this file to .env and fill in the values",
    "",
  ];

  const lines = Object.entries(schema.shape).map(([key, zodSchema]) => {
    let placeholder: any = "";
    let othertype: any = null;
    let actualSchema = zodSchema;
    if (zodSchema instanceof ZodOptional) actualSchema = zodSchema.unwrap();
    if (zodSchema instanceof ZodDefault) {
      actualSchema = zodSchema.def.innerType;
      placeholder = zodSchema.def.defaultValue ?? "";
      othertype = typeof zodSchema.def.defaultValue;
    }

    const type = getZodTypeName(actualSchema as ZodObject);

    return `${key}=${placeholder ?? ""}  # ${othertype ?? type}`;
  });

  const content = [...header, ...lines].join("\n") + "\n";
  fs.writeFileSync(path, content);
  console.log(content);
  console.log(`✅ .env.example generated at ${path}`);
}
