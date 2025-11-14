import { clsx } from 'clsx';

export interface ErrorMessageVariantProps {
  className?: string;
}

export function getErrorMessageClassName(props: ErrorMessageVariantProps): string {
  const { className } = props;

  return clsx('flex items-center justify-center w-full h-full min-h-[400px] p-6', className);
}
