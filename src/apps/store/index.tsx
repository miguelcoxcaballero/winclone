import type { AppProps } from '@/core/types';
import { Placeholder } from '@/components/Placeholder';

export default function App(props: AppProps) {
  return <Placeholder appId="store" {...props} />;
}
