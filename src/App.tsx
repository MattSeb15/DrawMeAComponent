import { useEffect, useState } from 'react'
import './App.css'
import { Category, Component } from './interfaces/panels/draw-me-panel'
import DrawMePanel from './components/panels/draw-me-panel'
import CategoryPanel from './components/panels/category-panel'

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

export default App
