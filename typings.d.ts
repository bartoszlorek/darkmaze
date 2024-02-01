declare module "*.module.scss" {
  const styles: Record<string, string>;
  export default styles;
}

declare module "*.frag" {
  const value: string;
  export default value;
}
