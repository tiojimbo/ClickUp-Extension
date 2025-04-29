export interface CustomField {
  id: string;
  name: string;
  type?: string;
  value: any;
  

  
}



export function formatCustomFieldValue(field: CustomField): string {
  const v = field.value;

  if (!v || (Array.isArray(v) && v.length === 0)) return "–";

  switch (field.type) {
    case "text":
    case "email":
    case "phone":
    case "url":
    case "location":
    case "short_text":
    case "long_text":
      return String(v);

    case "number":
      return typeof v === "number" ? v.toString() : parseFloat(v).toString();

    case "date":
      return new Date(Number(v)).toLocaleDateString();

    case "checkbox":
      return v === true || v === "true" ? "Sim" : "Não";

      case "dropdown":
        case "drop_down":
          if (typeof v === "object" && (v.label || v.name)) {
            return v.label || v.name;
          }
      return typeof v === "number" ? `Opção ${v}` : String(v);

    case "label":
    case "labels":
      if (Array.isArray(v)) {
        return v
          .map((item: any) =>
            typeof item === "object"
              ? item.label || item.name || item.id
              : item // ID bruto
          )
          .join(", ");
      }
      return typeof v === "object" ? v.label || v.name || v.id : String(v);

    case "user":
    case "person":
      if (Array.isArray(v)) {
        return v.map((u: any) => u.username || u.name || u.email || "Usuário").join(", ");
      }
      return v.username || v.name || v.email || "Usuário";

    case "task":
    case "relation":
    case "list_relationship":
      if (Array.isArray(v)) {
        return v.map((r: any) => r.name || r.id || "Relacionado").join(", ");
      }
      return v.name || v.id || "Relacionado";

    default:
      return typeof v === "object" ? JSON.stringify(v) : String(v);
  }
}

