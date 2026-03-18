import { ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useFlowStore } from "@/features/canvas/store";

interface TourStep {
	target: string;
	title: string;
	description: string;
	/** If set, show action hint and wait for condition before allowing Next */
	actionHint?: string;
	/** Key used to check auto-advance condition */
	waitKey?: "hasAgent" | "channelPanel";
}

const TOUR_STEPS: TourStep[] = [
	{
		target: ".react-flow__renderer",
		title: "Welcome to Agent Flow",
		description:
			"Agent Flow is a visual canvas for managing AI agents. You'll create agents, configure their channels, and chat with them — all from this board.",
	},
	{
		target: '[aria-label="Toggle agent list"]',
		title: "Step 1: Open the Agent List",
		description: "Click this button to open the sidebar where you can manage agents.",
		actionHint: "Click the bot button →",
	},
	{
		target: 'button[class*="w-full"]',
		title: "Step 2: Create Your First Agent",
		description:
			'Click "New Agent" to add an agent to the canvas. It will come with a default Direct Message channel.',
		actionHint: 'Click "New Agent" →',
		waitKey: "hasAgent",
	},
	{
		target: ".react-flow__node-agent",
		title: "Your Agent is Ready!",
		description:
			"Your agent appears on the canvas with a DM channel connected. Click the agent node to configure its name, model, and system prompt.",
	},
	{
		target: ".react-flow__node-channel",
		title: "Step 3: Configure the Channel",
		description:
			"Click the channel node (DM) to edit it. You can change the provider, model, and toggle Direct Message mode.",
		actionHint: "Click the DM node →",
		waitKey: "channelPanel",
	},
	{
		target: '[aria-label="Open chat"]',
		title: "Step 4: Chat with Your Agent",
		description:
			"Click the chat icon on the channel node to open a conversation. Messages stream in real-time from the backend.",
		actionHint: "Click the chat icon →",
	},
	{
		target: '[aria-label="Show tutorial"]',
		title: "You're All Set!",
		description:
			"You now know the basics: create agents, configure channels, and chat. Right-click nodes for more options. Click the ? button anytime to replay this tour.",
	},
];

const STORAGE_KEY = "agent-flow-tour-seen";

export function useOnboardingTour() {
	const [active, setActive] = useState(false);

	useEffect(() => {
		const seen = localStorage.getItem(STORAGE_KEY);
		if (!seen) {
			const timer = setTimeout(() => setActive(true), 600);
			return () => clearTimeout(timer);
		}
	}, []);

	const start = useCallback(() => setActive(true), []);
	const finish = useCallback(() => {
		setActive(false);
		localStorage.setItem(STORAGE_KEY, "true");
	}, []);

	return { active, start, finish };
}

interface OnboardingTourProps {
	active: boolean;
	onFinish: () => void;
}

export function OnboardingTour({ active, onFinish }: OnboardingTourProps) {
	const [step, setStep] = useState(0);
	const [rect, setRect] = useState<DOMRect | null>(null);
	const currentStep = TOUR_STEPS[step];

	// Read store conditions for auto-advance (stable selectors)
	const hasAgent = useFlowStore((s) => s.nodes.some((n) => n.type === "agent"));
	const channelPanel = useFlowStore((s) => s.panelType === "channel");

	const conditions: Record<NonNullable<TourStep["waitKey"]>, boolean> = {
		hasAgent,
		channelPanel,
	};
	const waitSatisfied = currentStep?.waitKey ? conditions[currentStep.waitKey] : false;

	// Measure target element
	const measure = useCallback(() => {
		if (!currentStep) return;
		const el = document.querySelector(currentStep.target);
		setRect(el ? el.getBoundingClientRect() : null);
	}, [currentStep]);

	useEffect(() => {
		if (!active) {
			setStep(0);
			return;
		}
		measure();
		window.addEventListener("resize", measure);
		window.addEventListener("scroll", measure, true);
		return () => {
			window.removeEventListener("resize", measure);
			window.removeEventListener("scroll", measure, true);
		};
	}, [active, measure]);

	// Auto-advance when waitFor condition met
	useEffect(() => {
		if (!active || !currentStep?.waitKey || !waitSatisfied) return;
		const timer = setTimeout(() => setStep((s) => s + 1), 400);
		return () => clearTimeout(timer);
	}, [active, currentStep?.waitKey, waitSatisfied]);

	if (!active || !currentStep) return null;

	const isLast = step === TOUR_STEPS.length - 1;
	const pad = 8;

	const getTooltipStyle = (): React.CSSProperties => {
		const vw = window.innerWidth;
		const vh = window.innerHeight;
		const tw = 320;
		const th = 200;
		const gap = 12;
		const margin = 12;

		if (!rect) return { position: "fixed", top: (vh - th) / 2, left: (vw - tw) / 2 };

		let top = 0;
		let left = 0;

		if (rect.bottom + gap + th < vh) {
			top = rect.bottom + gap;
			left = rect.left + rect.width / 2 - tw / 2;
		} else if (rect.top - gap - th > 0) {
			top = rect.top - gap - th;
			left = rect.left + rect.width / 2 - tw / 2;
		} else if (rect.left - gap - tw > 0) {
			top = rect.top + rect.height / 2 - th / 2;
			left = rect.left - gap - tw;
		} else {
			top = rect.top + rect.height / 2 - th / 2;
			left = rect.right + gap;
		}

		top = Math.max(margin, Math.min(vh - th - margin, top));
		left = Math.max(margin, Math.min(vw - tw - margin, left));
		return { position: "fixed", top, left };
	};

	const handleNext = () => {
		if (isLast) onFinish();
		else setStep((s) => s + 1);
	};

	const handleSkip = () => {
		onFinish();
		setStep(0);
	};

	const spotlightPath = rect
		? `polygon(
        0% 0%, 0% 100%,
        ${rect.left - pad}px 100%,
        ${rect.left - pad}px ${rect.top - pad}px,
        ${rect.right + pad}px ${rect.top - pad}px,
        ${rect.right + pad}px ${rect.bottom + pad}px,
        ${rect.left - pad}px ${rect.bottom + pad}px,
        ${rect.left - pad}px 100%,
        100% 100%, 100% 0%
      )`
		: undefined;

	const showNext = !currentStep.actionHint || !currentStep.waitKey;

	return (
		<>
			<div
				className="fixed inset-0 z-[10000] bg-background/60"
				style={spotlightPath ? { clipPath: spotlightPath } : undefined}
			/>

			{rect && (
				<div
					className="pointer-events-none fixed z-[10001] rounded-sm border-2 border-primary"
					style={{
						top: rect.top - pad,
						left: rect.left - pad,
						width: rect.width + pad * 2,
						height: rect.height + pad * 2,
					}}
				/>
			)}

			<div
				className="fixed z-[10002] w-80 rounded-sm border border-border bg-card p-4"
				style={getTooltipStyle()}
			>
				<div className="mb-1.5 flex items-center justify-between">
					<span className="font-heading text-sm font-bold">{currentStep.title}</span>
					<Button variant="ghost" size="icon-xs" onClick={handleSkip} aria-label="Close tour">
						<X size={12} />
					</Button>
				</div>

				<p className="mb-3 text-xs leading-relaxed text-muted-foreground">
					{currentStep.description}
				</p>

				{currentStep.actionHint && currentStep.waitKey && (
					<p className="mb-3 text-xs font-medium text-primary">{currentStep.actionHint}</p>
				)}

				<div className="flex items-center justify-between">
					<div className="flex gap-1">
						{TOUR_STEPS.map((_, i) => (
							<div
								key={i}
								className={`h-1.5 rounded-full ${
									i === step ? "w-4 bg-primary" : "w-1.5 bg-border"
								}`}
							/>
						))}
					</div>
					<div className="flex gap-1.5">
						<Button variant="ghost" size="xs" onClick={handleSkip}>
							Skip
						</Button>
						{showNext && (
							<Button size="xs" onClick={handleNext}>
								{isLast ? "Get Started" : "Next"}
								{!isLast && <ChevronRight size={12} />}
							</Button>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
