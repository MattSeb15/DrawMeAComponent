import { useEffect, useState } from 'react'
import './App.css'
import { Category, Component } from './interfaces/panels/draw-me-panel'
import DrawMePanel from './components/panels/draw-me-panel'
import CategoryItem, {
	ComponentPanel,
} from './components/panels/category-panel'

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

	const [selectedCategory, setSelectedCategory] = useState<Category | null>(
		() => {
			const savedSelectedCategory = localStorage.getItem('selectedCategory')
			return savedSelectedCategory ? JSON.parse(savedSelectedCategory) : null
		}
	)

	useEffect(() => {
		localStorage.setItem('selectedCategory', JSON.stringify(selectedCategory))
	}, [selectedCategory])

	useEffect(() => {
		localStorage.setItem('components', JSON.stringify(components))
	}, [components])

	useEffect(() => {
		localStorage.setItem('categories', JSON.stringify(categories))
	}, [categories])

	return (
		<div className='grid grid-cols-5 grid-rows-5 w-full h-full bg-custom-gray-3'>
			<div className='col-span-4 row-span-4 relative'>
				<div className='w-full h-full overflow-scroll'>
					<div className='w-[5000px] h-[5000px] paper'></div>
				</div>
				{selectedCategory && (
					<>
						<div className='w-fit h-[85%] max-h-fit bg-custom-gray-3 p-2 drop-shadow-lg overflow-auto border-custom-gray-2 border-2 rounded-lg absolute bottom-7 left-2'>
							<div className='flex flex-col gap-2 relative'>
								{selectedCategory ? (
									components.filter(
										component => component.categoryId === selectedCategory.id
									).length > 0 ? (
										components
											.filter(
												component =>
													component.categoryId === selectedCategory.id
											)
											.map(component => (
												<ComponentPanel
													key={component.name}
													component={component}
												/>
											))
									) : (
										<div className='px-3'>
											<span className='icon-[pixelarticons--mood-sad] size-10'></span>
											<p className='text-sm text-center font-bold'>
												No components
												<br />
												in this category
											</p>
										</div>
									)
								) : null}
							</div>
						</div>
						<div className='text-start text-sm font-bold absolute top-5 left-2 bg-custom-gray-3 p-2 drop-shadow-lg border-custom-gray-2 border-2 rounded-lg truncate max-w-fit w-72'>
							{selectedCategory.name}
						</div>
					</>
				)}
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
			<div className='col-span-4 row-start-5 bg-custom-gray-2 relative'>
				<div className='flex w-full h-full gap-4 items-center p-2 overflow-auto'>
					{categories.map((category, i) => (
						<CategoryItem
							key={category.id}
							className={i === 0 ? 'ml-5' : ''}
							category={category}
							selected={selectedCategory?.id === category.id}
							components={components.filter(c => c.categoryId === category.id)}
							onSelectCategory={category => {
								if (selectedCategory?.id === category.id)
									setSelectedCategory(null)
								else setSelectedCategory(category)
							}}
						/>
					))}
				</div>
			</div>
		</div>
	)
}

export default App
