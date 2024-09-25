import { useEffect, useRef, useState } from 'react'
import {
	CanvasProps,
	DrawMePanelProps,
} from '../../interfaces/panels/draw-me-panel'

const DrawMePanel: React.FC<DrawMePanelProps> = ({ onCreateComponent }) => {
	const [color, setColor] = useState('#ffffff')
	const [brushSize, setBrushSize] = useState(3)
	const [componentName, setComponentName] = useState('')
	const canvasRef = useRef<HTMLCanvasElement>(null)

	const clearCanvas = () => {
		const ctx = canvasRef.current?.getContext('2d')
		if (ctx) {
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
		}
	}

	const onChangeComponentName = (name: string) => {
		setComponentName(name)
	}

	const handleOnCreate = () => {
		if (canvasRef.current) {
			const ctx = canvasRef.current.getContext('2d')
			if (ctx) {
				const canvas = canvasRef.current
				const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
				const { data, width, height } = imageData

				let minX = width,
					minY = height,
					maxX = 0,
					maxY = 0

				for (let y = 0; y < height; y++) {
					for (let x = 0; x < width; x++) {
						const index = (y * width + x) * 4
						const alpha = data[index + 3]
						if (alpha > 0) {
							if (x < minX) minX = x
							if (x > maxX) maxX = x
							if (y < minY) minY = y
							if (y > maxY) maxY = y
						}
					}
				}

				const croppedWidth = maxX - minX + 1
				const croppedHeight = maxY - minY + 1

				const croppedCanvas = document.createElement('canvas')
				croppedCanvas.width = croppedWidth
				croppedCanvas.height = croppedHeight
				const croppedCtx = croppedCanvas.getContext('2d')

				if (croppedCtx) {
					croppedCtx.putImageData(
						ctx.getImageData(minX, minY, croppedWidth, croppedHeight),
						0,
						0
					)
					const dataUrl = croppedCanvas.toDataURL()
					onCreateComponent({
						name: componentName,
						categoryId: '1',
						dataUrl,
					})
					setComponentName('')
				}
			}
		}
	}

	return (
		<div className='grid grid-cols-6 grid-rows-6 gap-2 w-full h-1/2 bg-custom-gray-2 rounded-md overflow-auto'>
			<div className='col-span-5 row-span-5 p-1'>
				<div className='w-full h-full cross rounded-lg border-2 border-custom-gray-3'>
					<Canvas
						color={color}
						brushSize={brushSize}
						canvasRef={canvasRef}
					/>{' '}
				</div>
			</div>
			<div className='col-span-5 col-start-1 row-start-6 p-1'>
				<div className='flex gap-2'>
					<input
						type='text'
						placeholder='Component name'
						className='input input-bordered input-sm w-full max-w-xs bg-custom-gray-1'
						value={componentName}
						onChange={e => onChangeComponentName(e.target.value)}
					/>
					<button
						className='btn btn-square btn-sm border-none bg-green-800 hover:bg-green-900'
						onClick={handleOnCreate}>
						<span className='icon-[pixelarticons--plus]'></span>
					</button>
				</div>
			</div>
			<div className='row-span-6 col-start-6 row-start-1 p-1'>
				<div className='h-full flex flex-col items-center justify-between gap-3'>
					<div className='flex flex-col gap-2'>
						<input
							onChange={e => setBrushSize(parseInt(e.target.value))}
							type='range'
							min={1}
							max='50'
							value={brushSize}
							style={{
								writingMode: 'vertical-lr',
								direction: 'rtl',
								verticalAlign: 'bottom',
							}}
							className='h-24'
						/>
						<div className='input input-xs bg-custom-gray-1 w-10 text-center select-none'>
							{brushSize}
						</div>
					</div>
					<input
						className='rounded-full size-8 bg-transparent flex-none'
						type='color'
						value={color}
						onChange={e => setColor(e.target.value)}
					/>

					<div className='flex flex-col h-full justify-around'>
						<button
							className='btn btn-square btn-sm border-none bg-red-600 hover:bg-custom-gray-3/50'
							onClick={clearCanvas}>
							<span className='icon-[pixelarticons--trash-alt]'></span>
						</button>
					</div>
				</div>
			</div>
		</div>
	)
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

	/* 	const clearCanvas = () => {
		if (context && canvasRef.current) {
			context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
		}
	} */

	return (
		<canvas
			ref={canvasRef}
			onMouseDown={startDrawing}
			onMouseMove={draw}
			onMouseUp={stopDrawing}
			onMouseLeave={stopDrawing}
		/>
	)
}

export default DrawMePanel
