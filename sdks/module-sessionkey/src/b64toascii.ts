export const b64toascii = (b64: string) => {
  if (typeof window !== "undefined") {
    const u8 = new Uint8Array(
      atob(b64)
        .split("")
        .map(function (c) {
          return c.charCodeAt(0);
        })
    );
    const decoder = new TextDecoder();
    return decoder.decode(u8);
  }
  if (typeof window === "undefined") {
    return Buffer.from(b64, "base64").toString("ascii");
  }
  throw new Error("Invalid environment");
};
