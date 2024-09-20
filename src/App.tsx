import { useEffect, useRef, useState } from 'react'
import './App.css'
import {
	ICanvasComponent,
	Category,
	Component,
} from './interfaces/panels/draw-me-panel'
import DrawMePanel from './components/panels/draw-me-panel'
import CategoryItem, {
	ComponentPanel,
} from './components/panels/category-panel'
import Moveable from 'react-moveable'
import Selecto from 'react-selecto'

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
					{ name: 'All', id: '0' },
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

	const [canvasComponents, setCanvasComponents] = useState<ICanvasComponent[]>(
		() => {
			const savedCanvasComponents = localStorage.getItem('canvasComponents')
			return savedCanvasComponents ? JSON.parse(savedCanvasComponents) : []
		}
	)
	/* TODO MAKE A STATE WITH ALL SETTINGS OF DRAWMEACOMPONENT APP */

	useEffect(() => {
		localStorage.setItem('canvasComponents', JSON.stringify(canvasComponents))
	}, [canvasComponents])

	const [auxSelectedCategory, setAuxSelectedCategory] =
		useState<Category | null>(null)

	const [auxSelectedComponent, setAuxSelectedComponent] =
		useState<Component | null>(null)

	const [categoryName, setCategoryName] = useState('')

	const onChangeCategoryName = (name: string) => {
		setCategoryName(name)
	}

	useEffect(() => {
		localStorage.setItem('selectedCategory', JSON.stringify(selectedCategory))
	}, [selectedCategory])

	useEffect(() => {
		localStorage.setItem('components', JSON.stringify(components))
	}, [components])

	useEffect(() => {
		localStorage.setItem('categories', JSON.stringify(categories))
	}, [categories])

	const [contextMenu, setContextMenu] = useState<{
		x: number
		y: number
	} | null>(null)

	const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
		e.preventDefault()
		const menuHeight = 95 // Altura aproximada del menú
		const windowHeight = window.innerHeight
		const cursorY = e.clientY

		let y = cursorY
		if (cursorY + menuHeight > windowHeight) {
			y = cursorY - menuHeight
		}

		setContextMenu({ x: e.clientX, y })
	}

	const handleClickOutside = () => {
		setContextMenu(null)
		setAuxSelectedCategory(null)
		setAuxSelectedComponent(null)
	}

	const handleMouseDown = (
		e: React.MouseEvent<HTMLDivElement>,
		category: Category
	) => {
		if (contextMenu) {
			setContextMenu(null)
		}

		if (e.button === 2) {
			console.log('right click to:', category)
			setAuxSelectedCategory(category)
			setAuxSelectedComponent(null)
		}
	}

	const handleMouseDownComponent = (
		e: React.MouseEvent<HTMLDivElement>,
		component: Component
	) => {
		if (contextMenu) {
			setContextMenu(null)
		}

		if (e.button === 2) {
			console.log('right click to:', component)
			setAuxSelectedComponent(component)
			setAuxSelectedCategory(null)
		}
	}

	useEffect(() => {
		document.addEventListener('click', handleClickOutside)
		return () => {
			document.removeEventListener('click', handleClickOutside)
		}
	}, [])

	const handleOnDragImgStart = (
		e: React.DragEvent<HTMLDivElement>,
		component: Component
	) => {
		e.dataTransfer.setData('component', JSON.stringify(component))
		console.log('drag start')
		console.log(component)
	}

	const handleOnDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		const component = JSON.parse(
			e.dataTransfer.getData('component')
		) as Component
		const canvas = canvasRef.current
		if (canvas) {
			const rect = canvas.getBoundingClientRect()
			const x = e.clientX - rect.left
			const y = e.clientY - rect.top
			const scale = 1
			const id = component.id + '_' + canvasComponents.length
			const style = `translate(${x}px, ${y}px)`

			setCanvasComponents([
				...canvasComponents,
				{
					id,
					component,
					transform: style,
					zIndex: canvasComponents.length + 1,
					scale,
				},
			])
		}
	}
	const canvasRef = useRef<HTMLDivElement>(null)

	const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 })
	useEffect(() => {
		const handleScroll = () => {
			if (canvasRef.current) {
				setScrollPosition({
					x: canvasRef.current.scrollLeft,
					y: canvasRef.current.scrollTop,
				})
			}
		}

		const canvasElement = canvasRef.current
		if (canvasElement) {
			canvasElement.addEventListener('scroll', handleScroll)
		}

		return () => {
			if (canvasElement) {
				canvasElement.removeEventListener('scroll', handleScroll)
			}
		}
	}, [])

	const [targets, setTargets] = useState<Array<HTMLElement | SVGElement>>([])
	const moveableRef = useRef<Moveable>(null)
	const selectoRef = useRef<Selecto>(null)

	return (
		<div className='grid grid-cols-9 grid-rows-7 w-full h-full bg-custom-gray-3 relative'>
			<div className='col-span-7 row-span-6 relative'>
				<div className='w-full h-full overflow-scroll'>
					<div
						ref={canvasRef}
						onDrop={handleOnDrop}
						onDragOver={e => e.preventDefault()}
						className='w-[5000px] h-[5000px] paper relative elements'>
						{/* 	<div
							className='target bg-white size-28'
							ref={targetRef}>
							Target
						</div> */}
						{canvasComponents.map((c, i) => (
							<div
								className='target absolute'
								style={{
									transform: c.transform,
								}}
								id={c.id}
								key={i}>
								<img
									draggable={false}
									src={c.component.dataUrl}
									alt={c.component.name}
									className='size-32 object-contain'
								/>
							</div>
						))}

						<Moveable
							ref={moveableRef}
							target={targets}
							draggable={true}
							scalable={true}
							rotatable={true}
							throttleScale={0}
							keepRatio={true}
							onClickGroup={e => {
								selectoRef.current!.clickTarget(e.inputEvent, e.inputTarget)
							}}
							/* 	persistData={{}} */
							onRender={e => {
								/* console.log(e.moveable.getRect()) */

								e.target.style.cssText += e.cssText
							}}
							onRenderGroup={e => {
								e.events.forEach(ev => {
									ev.target.style.cssText += ev.cssText
								})
							}}
							onRenderEnd={e => {
								console.log(e.target.id)
								console.log(e.target.style.cssText)
								console.log(e.target)
								const finalTransform = e.target.style.transform
								const id = e.target.id
								const canvasComponent = canvasComponents.find(c => c.id === id)
								if (canvasComponent) {
									const newCanvasComponents = canvasComponents.map(c =>
										c.id === id ? { ...c, transform: finalTransform } : c
									)
									setCanvasComponents(newCanvasComponents)
								}
							}}
							onRenderGroupEnd={e => {
								console.log(e.targets.map(t => t.style.transform))
								const targets = e.targets
								const updatedCanvasComponents = canvasComponents.map(c => {
									const target = targets.find(t => t.id === c.id)
									if (target) {
										return { ...c, transform: target.style.transform }
									}
									return c
								})
								setCanvasComponents(updatedCanvasComponents)
							}}

							/* onChangeTargets={e => {
								console.log(
									'??',
									JSON.stringify(e.moveable.getRect(), undefined, 4)
								)
							}} */
						/>
						<Selecto
							ref={selectoRef}
							dragContainer={'.elements'}
							selectableTargets={['.target']}
							hitRate={0}
							selectByClick={true}
							selectFromInside={false}
							toggleContinueSelect={['shift']}
							ratio={0}
							onDragStart={e => {
								const target = e.inputEvent.target
								if (
									moveableRef.current!.isMoveableElement(target) ||
									targets!.some(t => t === target || t.contains(target))
								) {
									e.stop()
								}
							}}
							onSelect={e => {
								if (e.isDragStartEnd) {
									return
								}
								setTargets(e.selected)
							}}
							onSelectEnd={e => {
								if (e.isDragStartEnd) {
									e.inputEvent.preventDefault()
									moveableRef.current!.waitToChangeTarget().then(() => {
										moveableRef.current!.dragStart(e.inputEvent)
									})
								}
								setTargets(e.selected)
							}}
						/>
					</div>
				</div>
				{selectedCategory && (
					<>
						<div className='w-fit h-[85%] max-h-fit bg-custom-gray-3 p-2 drop-shadow-lg overflow-auto border-custom-gray-2 border-2 rounded-lg absolute bottom-7 left-2'>
							<div className='flex flex-col gap-2 relative'>
								{selectedCategory ? (
									selectedCategory.id === '0' ? (
										components.length > 0 ? (
											components.map(component => (
												<ComponentPanel
													key={component.id}
													onDragComponentStart={handleOnDragImgStart}
													component={component}
													categoryName={
														categories.find(
															category => category.id === component.categoryId
														)?.name
													}
													onContextMenu={handleContextMenu}
													onMouseDown={e =>
														handleMouseDownComponent(e, component)
													}
												/>
											))
										) : (
											<div className='px-3'>
												<span className='icon-[pixelarticons--inbox-all] size-10'></span>
												<p className='text-sm text-center font-bold'>
													All
													<br />
													Components
													<br />
													(Add some components)
												</p>
											</div>
										)
									) : components.filter(
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
													onContextMenu={handleContextMenu}
													onMouseDown={e =>
														handleMouseDownComponent(e, component)
													}
													onDragComponentStart={handleOnDragImgStart}
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
			<div className='col-span-2 row-span-7 bg-custom-gray-1'>
				<div className='flex flex-col w-full h-full items-center'>
					<DrawMePanel
						onCreateComponent={component => {
							const currentId = selectedCategory?.id || '0'
							component.categoryId = currentId
							component.id = crypto.randomUUID()
							if (component.name === '')
								component.name = 'C-' + crypto.randomUUID().slice(0, 5)
							setComponents([...components, component])
						}}
					/>
				</div>
			</div>
			<div className='col-span-7 row-start-7 bg-custom-gray-2 relative'>
				<div className='flex w-full h-full justify-between'>
					<div className='flex gap-4 items-center p-2 overflow-auto'>
						{categories.map((category, i) => (
							<CategoryItem
								key={category.id}
								className={i === 0 ? 'ml-5' : ''}
								category={category}
								selected={selectedCategory?.id === category.id}
								components={
									category.id === '0'
										? components
										: components.filter(
												component => component.categoryId === category.id
										  )
								}
								onSelectCategory={category => {
									if (selectedCategory?.id === category.id)
										setSelectedCategory(null)
									else setSelectedCategory(category)
								}}
								onContextMenu={i === 0 ? undefined : handleContextMenu}
								onMouseDown={e =>
									i === 0 ? undefined : handleMouseDown(e, category)
								}
							/>
						))}
					</div>
					<div className='w-3/12 flex-none h-full bg-custom-gray-1 border-4 border-custom-gray-2'>
						<div className='flex gap-4 h-full items-center justify-center p-2'>
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
									if (categoryName === '') return

									const id = crypto.randomUUID()
									setCategories([...categories, { name: categoryName, id }])
									setCategoryName('')

									/* 			onCreateCategory({
										name: categoryName,
										id: crypto
											.getRandomValues(new Uint32Array(1))[0]
											.toString(16),
									})
									onChangeCategoryName('') */
								}}>
								<span className='icon-[pixelarticons--plus]'></span>
							</button>
						</div>
					</div>
				</div>
			</div>
			{contextMenu && (
				<ul
					className='absolute rounded-lg bg-custom-gray-3 border-2 border-custom-gray-2 shadow-lg z-50'
					style={{
						top: contextMenu.y,
						left: contextMenu.x,
					}}>
					<li
						className='btn rounded-b-none bg-inherit border-none flex hover:bg-custom-gray-2/50'
						onClick={() => {
							if (auxSelectedComponent) {
								setComponents(
									components.filter(
										component => component.name !== auxSelectedComponent?.name
									)
								)
								setAuxSelectedComponent(null)
								setContextMenu(null)
							}

							if (!auxSelectedCategory) return
							setCategories(
								categories.filter(
									category => category.id !== auxSelectedCategory?.id
								)
							)
							//also delete all components from this category
							setComponents(
								components.filter(
									component => component.categoryId !== auxSelectedCategory?.id
								)
							)
							setAuxSelectedCategory(null)
							setContextMenu(null)
						}}>
						<span className='icon-[pixelarticons--trash-alt]'></span>
						<p>Borrar</p>
					</li>
					<div className='divider h-0 my-1'></div>
					<li className='btn rounded-t-none bg-inherit border-none flex hover:bg-custom-gray-2/50'>
						<span className='icon-[pixelarticons--edit]'></span>
						<p>Editar</p>
					</li>
				</ul>
			)}
		</div>
	)
}

export default App
