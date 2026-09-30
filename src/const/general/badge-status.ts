export const getAssetConditionBadgeVariant = (status: string) => {
  switch (status) {
    case "BAIK":
      return "default";
    case "RUSAK_RINGAN":
      return "yellow";
    case "RUSAK_BERAT":
      return "destructive";
    case "SUDAH_DIPERBAIKI":
      return "green";
    default:
      return "secondary";
  }
};

export const getEventBadgeVariant = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "default";
    case "INACTIVE":
      return "destructive";
    case "DONE":
      return "green";
    default:
      return "secondary";
  }
};
