export interface Component {
	id: string
	name: string
	categoryId: string
	dataUrl: string
}

export interface Category {
	name: string
	id: string
}

export interface DrawMePanelProps {
	onCreateComponent: (component: Component) => void
}

export interface CanvasProps {
	color: string
	brushSize: number
	canvasRef: React.RefObject<HTMLCanvasElement>
}

export interface ControlsProps {
	canvasRef: React.RefObject<HTMLCanvasElement>
	color: string
	brushSize: number
	componentName: string
	onColorChange: (color: string) => void
	onBrushSizeChange: (size: number) => void
	onClear: () => void
	onChangeComponentName: (name: string) => void
	onCreateComponent: (component: Component) => void
}

export interface ICanvasComponent {
	id: string
	component: Component
	transform: string
	zIndex: number
	scale: number
}

export interface ScrollPosition {
	x: number
	y: number
}

export interface DrawMePanelState {
	components: Component[]
	categories: Category[]
	selectedCategory?: Category
	selectedComponent?: Component
	canvasComponents: ICanvasComponent[]
	color: string
	brushSize: number
	componentName: string
	canvasScrollPosition: ScrollPosition
}
