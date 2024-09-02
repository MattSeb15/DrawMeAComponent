export interface Component {
	name: string
	categoryId: string
	dataUrl: string
}

export interface Category {
	name: string
	id: string
}

export interface DrawMePanelProps {
	categories: Category[]
	onCreateComponent: (component: Component) => void
	onCreateCategory: (category: Category) => void
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
	categoryName: string
	categories: Category[]
	selectedCategory: Category | null
	onColorChange: (color: string) => void
	onBrushSizeChange: (size: number) => void
	onClear: () => void
	onChangeComponentName: (name: string) => void
	onChangeCategoryName: (name: string) => void
	onCreateCategory: (category: Category) => void
	onChangeCategory: (category: Category) => void
	onCreateComponent: (component: Component) => void
}
