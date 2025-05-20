
import { AuroraButton } from "@/components/ui/aurora-button";

function AuroraButtonDemo() {
  return <AuroraButton>Click me</AuroraButton>;
}

function AuroraButtonDemo2() {
  return <AuroraButton className="px-6 py-3">Custom Size</AuroraButton>;
}

function AuroraButtonDemo3() {
  return (
    <AuroraButton glowClassName="from-white/70 via-gray-300 to-white/90">
      Custom Gradient
    </AuroraButton>
  );
}

export { AuroraButtonDemo, AuroraButtonDemo2, AuroraButtonDemo3 };
