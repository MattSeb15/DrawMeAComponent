import { useEffect, useRef, useState } from 'react'
import './App.css'

interface Component {
	name: string
	categoryId: string
	dataUrl: string
}

function App() {
	const [components, setComponents] = useState<Component[]>(() => {
		const savedComponents = localStorage.getItem('components')
		return savedComponents ? JSON.parse(savedComponents) : []
	})

	const [categories, setCategories] = useState<Category[]>(() => {
		const savedCategories = localStorage.getItem('categories')
		return savedCategories
			? JSON.parse(savedCategories)
			: [
					{ name: 'Uncategorized', id: '1' },
					{ name: 'Button', id: '2' },
					{ name: 'Input', id: '3' },
					{ name: 'Text', id: '4' },
					{ name: 'Container', id: '5' },
			  ]
	})

	useEffect(() => {
		localStorage.setItem('components', JSON.stringify(components))
	}, [components])

	useEffect(() => {
		localStorage.setItem('categories', JSON.stringify(categories))
	}, [categories])

	return (
		<div className='grid grid-cols-5 grid-rows-5 w-full h-full bg-custom-gray-3'>
			<div className='col-span-4 row-span-4'>
				<div className='w-full h-full overflow-scroll'>
					<div className='w-[5000px] h-[5000px] static paper '></div>
				</div>
			</div>
			<div className='row-span-5 col-start-5 bg-custom-gray-1'>
				<div className='flex flex-col w-full h-full items-center'>
					<DrawMePanel
						categories={categories}
						onCreateCategory={category => {
							setCategories([...categories, category])
							console.log('created category:', category)
						}}
						onCreateComponent={component => {
							if (component.name === '')
								component.name = 'Component ' + (components.length + 1)
							setComponents([...components, component])
						}}
					/>
				</div>
			</div>
			<div className='col-span-4 row-start-5 bg-custom-gray-2'>
				<div className='flex w-full h-full gap-4 items-center p-2'>
					{categories.map(category => (
						<CategoryPanel
							key={category.id}
							category={category}
							components={components.filter(c => c.categoryId === category.id)}
						/>
					))}
				</div>
			</div>
		</div>
	)
}

const CategoryPanel: React.FC<{
	category: Category
	components: Component[]
}> = ({ category, components }) => {
	if (components.length === 0) return null
	return (
		<div className='indicator w-fit h-fit'>
			<span className='indicator-item badge indicator-bottom badge-secondary text-white font-bold'>
				{components.length}
			</span>
			<div className='dropdown dropdown-top'>
				<div
					tabIndex={0}
					role='button'
					className='btn m-1 bg-custom-gray-1 hover:bg-custom-gray-3 border-none'>
					{category.name}
				</div>
				<div
					tabIndex={0}
					className='dropdown-content z-[1] max-w-fit w-[500px] h-fit bg-custom-gray-3 p-2 shadow overflow-auto border-custom-gray-2 border-2 rounded-lg'>
					<div className='flex gap-2'>
						{components.map(component => (
							<ComponentPanel
								key={component.name}
								component={component}
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}

const ComponentPanel: React.FC<{ component: Component }> = ({ component }) => {
	return (
		<div className='flex-none size-32 bg-custom-gray-2 rounded-lg relative'>
			<div className='absolute w-full top-1 px-1 flex justify-center'>
				<p className='font-medium w-fit text-xs text-center px-2 bg-custom-gray-3/80 rounded truncate'>
					{component.name}
				</p>
			</div>
			<img
				src={component.dataUrl}
				alt={component.name}
				className='w-full h-full object-contain rounded-t-xl'
			/>
		</div>
	)
}

interface Category {
	name: string
	id: string
}

interface DrawMePanelProps {
	categories: Category[]
	onCreateComponent: (component: Component) => void
	onCreateCategory: (category: Category) => void
}

const DrawMePanel: React.FC<DrawMePanelProps> = ({
	categories,
	onCreateComponent,
	onCreateCategory,
}) => {
	const [color, setColor] = useState('#ffffff')
	const [brushSize, setBrushSize] = useState(3)
	const [componentName, setComponentName] = useState('')
	const [categoryName, setCategoryName] = useState('')

	const [selectedCategory, setSelectedCategory] = useState<Category | null>(
		null
	)
	const canvasRef = useRef<HTMLCanvasElement>(null)

	const clearCanvas = () => {
		const ctx = canvasRef.current?.getContext('2d')
		if (ctx) {
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
		}
	}

	const onChangeCategory = (category: Category) => {
		setSelectedCategory(category)
		console.log(category)
	}

	const onChangeComponentName = (name: string) => {
		setComponentName(name)
	}

	return (
		<div className='flex flex-col w-full h-full p-2 overflow-auto'>
			<div className='cross w-full h-80 mb-5'>
				<Canvas
					color={color}
					brushSize={brushSize}
					canvasRef={canvasRef}
				/>
			</div>
			<Controls
				canvasRef={canvasRef}
				color={color}
				brushSize={brushSize}
				componentName={componentName}
				categoryName={categoryName}
				categories={categories}
				selectedCategory={selectedCategory}
				onColorChange={setColor}
				onBrushSizeChange={setBrushSize}
				onClear={clearCanvas}
				onChangeComponentName={onChangeComponentName}
				onChangeCategoryName={setCategoryName}
				onCreateCategory={onCreateCategory}
				onChangeCategory={onChangeCategory}
				onCreateComponent={c => {
					onCreateComponent(c)
					//clear canvas
					clearCanvas()
					//clear component name
					setComponentName('')
				}}
			/>
		</div>
	)
}

interface CanvasProps {
	color: string
	brushSize: number
	canvasRef: React.RefObject<HTMLCanvasElement>
}

const Canvas: React.FC<CanvasProps> = ({ color, brushSize, canvasRef }) => {
	const [drawing, setDrawing] = useState(false)
	const [context, setContext] = useState<CanvasRenderingContext2D | null>(null)

	const resizeCanvas = () => {
		const canvas = canvasRef.current
		if (canvas && context) {
			const savedImageData = context.getImageData(
				0,
				0,
				canvas.width,
				canvas.height
			)
			const parent = canvas.parentElement
			if (parent) {
				canvas.width = parent.clientWidth
				canvas.height = parent.clientHeight
				context.putImageData(savedImageData, 0, 0)
			}
		}
	}

	useEffect(() => {
		const canvas = canvasRef.current
		if (canvas) {
			const parent = canvas.parentElement
			if (parent) {
				canvas.width = parent.clientWidth
				canvas.height = parent.clientHeight
				const ctx = canvas.getContext('2d')
				if (ctx) {
					setContext(ctx)
					ctx.lineJoin = 'round'
					ctx.lineCap = 'round'
				}
			}
			window.addEventListener('resize', resizeCanvas)
			return () => {
				window.removeEventListener('resize', resizeCanvas)
			}
		}
	}, [])

	useEffect(() => {
		if (context) {
			context.strokeStyle = color
			context.lineWidth = brushSize
		}
	}, [color, brushSize, context])

	const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
		if (!context) return
		const { offsetX, offsetY } = event.nativeEvent
		context.beginPath()
		context.moveTo(offsetX, offsetY)
		setDrawing(true)
	}

	const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
		if (!drawing || !context) return
		const { offsetX, offsetY } = event.nativeEvent
		context.lineTo(offsetX, offsetY)
		context.stroke()
	}

	const stopDrawing = () => {
		if (!context) return
		context.closePath()
		setDrawing(false)
	}

	const clearCanvas = () => {
		if (context && canvasRef.current) {
			context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
		}
	}

	return (
		<div className='w-full h-full relative rounded-lg border-2 border-custom-gray-3'>
			<canvas
				ref={canvasRef}
				onMouseDown={startDrawing}
				onMouseMove={draw}
				onMouseUp={stopDrawing}
				onMouseLeave={stopDrawing}
				style={{ width: '100%', height: '100%', display: 'block' }}
			/>
			<button
				onClick={clearCanvas}
				className='btn btn-square bg-custom-gray-2 hover:bg-custom-gray-3 border-none text-xl'
				style={{ position: 'absolute', top: '10px', right: '10px' }}>
				<span className='icon-[pixelarticons--trash]'></span>
			</button>
		</div>
	)
}

interface ControlsProps {
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

const Controls: React.FC<ControlsProps> = ({
	canvasRef,
	color,
	brushSize,
	componentName,
	categoryName,
	categories,
	selectedCategory,
	onColorChange,
	onBrushSizeChange,
	onChangeComponentName,
	onChangeCategoryName,
	onCreateCategory,
	onChangeCategory,
	onCreateComponent,
}) => {
	return (
		<div className='controls flex flex-col items-start p-2 bg-custom-gray-2 rounded-md'>
			<div className='flex flex-col gap-5 w-full'>
				<p className='font-medium'>Pencil</p>
				<div className='w-full'>
					<input
						type='range'
						min='1'
						max='5'
						className={`range range-sm`}
						style={{ accentColor: color }}
						value={brushSize}
						onChange={e => onBrushSizeChange(parseInt(e.target.value))}
					/>
					<div className='flex w-full justify-between px-2 text-xs'>
						<span>1</span>
						<span>2</span>
						<span>3</span>
						<span>4</span>
						<span>5</span>
					</div>
				</div>
				<input
					type='color'
					value={color}
					onChange={e => onColorChange(e.target.value)}
				/>
			</div>
			<div className='divider my-1'></div>
			<div className='w-full flex flex-col gap-4'>
				<p className='font-medium'>Component Options</p>
				<input
					type='text'
					placeholder='Component name'
					className='input input-bordered input-sm w-full max-w-xs bg-custom-gray-1'
					value={componentName}
					onChange={e => onChangeComponentName(e.target.value)}
				/>
				<label className='form-control w-full max-w-xs'>
					<div className='label'>
						<span className='label-text'>Select Category</span>
					</div>
					<select
						className='select select-bordered select-sm w-full max-w-xs bg-custom-gray-1 max-h-8'
						onChange={e =>
							onChangeCategory(
								categories.find(category => category.name === e.target.value) ||
									categories[0]
							)
						}
						value={
							selectedCategory ? selectedCategory.name : categories[0].name
						}>
						{categories.map(category => (
							<option key={category.id}>{category.name}</option>
						))}
					</select>
				</label>
				<div className='flex gap-4'>
					<input
						type='text'
						placeholder='Create new category'
						className='input input-bordered input-sm w-full max-w-xs bg-custom-gray-1'
						value={categoryName}
						onChange={e => onChangeCategoryName(e.target.value)}
					/>
					<button
						className='btn btn-square btn-sm bg-custom-gray-3 hover:bg-custom-gray-3 border-none text-xl'
						onClick={() => {
							onCreateCategory({
								name: categoryName,
								id: crypto.getRandomValues(new Uint32Array(1))[0].toString(16),
							})
							onChangeCategoryName('')
						}}>
						<span className='icon-[pixelarticons--plus]'></span>
					</button>
				</div>
				<button
					className='btn btn-block btn-sm border-none bg-green-900/50 hover:bg-green-900/30'
					onClick={() => {
						if (canvasRef.current) {
							const ctx = canvasRef.current.getContext('2d')
							if (ctx) {
								const dataUrl = ctx.canvas.toDataURL()
								onCreateComponent({
									name: componentName,
									categoryId: selectedCategory ? selectedCategory.id : '1',
									dataUrl,
								})
							}
						}
					}}>
					Create
				</button>
			</div>
		</div>
	)
}

export default App
