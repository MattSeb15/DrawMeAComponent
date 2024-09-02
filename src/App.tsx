import { useEffect, useRef, useState } from 'react'
import './App.css'

function App() {
	return (
		<div className='flex flex-col w-full h-full'>
			<div className='flex w-full h-32 bg-custom-gray-1 drop-shadow-xl'></div>
			<div className='flex w-full h-full overflow-auto'>
				<div className='flex-none w-60 bg-custom-gray-1'></div>
				<div className='grow bg-custom-gray-2 overflow-scroll'>
					<div className='w-[5000px] h-[5000px] static paper'>
						<MinimizableContainer />
					</div>
				</div>
			</div>
		</div>
	)
}

const MinimizableContainer: React.FC = () => {
	return (
		<div className='flex flex-col size-80 bg-custom-gray-1 border-t-4 border-t-custom-gray-2 absolute bottom-7 right-7 rounded-xl p-1'>
			<button
				className='btn btn-sm btn-block bg-custom-gray-2 hover:bg-custom-gray-3 border-none '
				onClick={() => console.log('clicked')}></button>
			<div className='flex-grow cross relative'>
				<Canvas />
			</div>
		</div>
	)
}

const Canvas: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const [drawing, setDrawing] = useState(false)
	const [context, setContext] = useState<CanvasRenderingContext2D | null>(null)
	const [color, setColor] = useState('#ffffff')

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
					ctx.lineWidth = 4
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

	const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
		if (!context) return
		const { offsetX, offsetY } = event.nativeEvent
		context.strokeStyle = color // Set the current color for drawing
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

	const changeColor = (event: React.ChangeEvent<HTMLInputElement>) => {
		setColor(event.target.value)
	}

	return (
		<div style={{ width: '100%', height: '100%', position: 'relative' }}>
			<canvas
				ref={canvasRef}
				onMouseDown={startDrawing}
				onMouseMove={draw}
				onMouseUp={stopDrawing}
				onMouseLeave={stopDrawing}
				style={{ width: '100%', height: '100%', display: 'block' }}
			/>
			<div className='absolute bottom-0 w-full'>
				<div style={{ marginBottom: '10px' }}>
					<button
						className='btn btn-square bg-custom-gray-2 hover:bg-custom-gray-3 border-none text-xl'
						onClick={clearCanvas}>
						<span className='icon-[pixelarticons--trash]'></span>
					</button>
					<input
						type='color'
						onChange={changeColor}
						value={color}
						style={{ marginLeft: '10px' }}
					/>
				</div>
			</div>
		</div>
	)
}

export default App
