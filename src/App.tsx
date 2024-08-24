import { ReactNode, useEffect, useRef, useState } from 'react'
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
				<button className='btn btn-square bg-custom-gray-2 hover:bg-custom-gray-3 border-none absolute bottom-3 right-3 text-xl'>
					+
				</button>
				<canvas className='w-full h-full'></canvas>
			</div>
		</div>
	)
}

export default App
