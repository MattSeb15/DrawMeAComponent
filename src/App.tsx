import { useEffect, useRef, useState } from 'react'
import './App.css'
import {
	ICanvasComponent,
	Category,
	Component,
	ICanvasOptions,
} from './interfaces/panels/draw-me-panel'
import DrawMePanel from './components/panels/draw-me-panel'
import CategoryItem, {
	ComponentPanel,
} from './components/panels/category-panel'
import Moveable, { MoveableManagerInterface, Renderer } from 'react-moveable'
import Selecto from 'react-selecto'
import { arrayMove, List } from 'react-movable'

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
				{
					id,
					component,
					transform: style,
					zIndex: canvasComponents.length + 1,
					scale,
					visible: true,
					layerName: component.name + '_' + canvasComponents.length,
				},
				...canvasComponents,
			])
		}
	}

	const canvasRef = useRef<HTMLDivElement>(null)
	const [targets, setTargets] = useState<Array<HTMLElement | SVGElement>>([])
	const moveableRef = useRef<Moveable>(null)
	const selectoRef = useRef<Selecto>(null)

	const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 })

	const [clickedLayer, setClickedLayer] = useState<ICanvasComponent | null>(
		null
	)

	const [clickedLayerName, setClickedLayerName] = useState('')
	const inputRef = useRef<HTMLInputElement>(null)
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (inputRef.current && inputRef.current.contains(event.target as Node)) {
				// Si el clic ocurrió dentro del input, no hacer nada
				return
			}
			setClickedLayer(null)
			if (clickedLayerName !== '') {
				const updatedCanvasComponents = canvasComponents.map(c =>
					c.id === clickedLayer?.id ? { ...c, layerName: clickedLayerName } : c
				)
				setCanvasComponents(updatedCanvasComponents)
				setClickedLayerName('')
			}
		}

		document.addEventListener('mousedown', handleClickOutside)

		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [canvasComponents, clickedLayer, clickedLayerName])

	useEffect(() => {
		const handleScroll = () => {
			if (canvasRef.current) {
				setScrollPosition({
					x: canvasRef.current.scrollLeft,
					y: canvasRef.current.scrollTop,
				})
			}
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			console.log(`Tecla presionada: ${event.key}`)

			switch (event.key.toLowerCase()) {
				case 'delete': {
					if (targets.length === 0) return
					const updatedCanvasComponents = canvasComponents.filter(
						c => !targets.map(t => t.id).includes(c.id)
					)
					setCanvasComponents(updatedCanvasComponents)
					setTargets([])
					break
				}
				case 's':
					setCanvasOptions(prevOptions => ({
						...prevOptions,
						scalable: !prevOptions.scalable,
					}))
					break
				case 'r':
					setCanvasOptions(prevOptions => ({
						...prevOptions,
						rotatable: !prevOptions.rotatable,
					}))
					break
				case 'd':
					setCanvasOptions(prevOptions => ({
						...prevOptions,
						draggable: !prevOptions.draggable,
					}))
					break
				case 'k':
					setCanvasOptions(prevOptions => ({
						...prevOptions,
						keepRatio: !prevOptions.keepRatio,
					}))
					break
				default:
					break
			}
		}

		const canvasElement = canvasRef.current
		if (canvasElement) {
			canvasElement.addEventListener('scroll', handleScroll)
		}

		window.addEventListener('keydown', handleKeyDown)

		return () => {
			if (canvasElement) {
				canvasElement.removeEventListener('scroll', handleScroll)
			}
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [targets, canvasComponents])

	useEffect(() => {
		if (clickedLayer) {
			inputRef.current?.focus()
		}
	}, [clickedLayer])

	const handleKeyDownInput = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter') {
			setClickedLayer(null)
			if (clickedLayerName !== '') {
				const updatedCanvasComponents = canvasComponents.map(c =>
					c.id === clickedLayer?.id ? { ...c, layerName: clickedLayerName } : c
				)
				setCanvasComponents(updatedCanvasComponents)
				setClickedLayerName('')
			}
			//unfocus input
			inputRef.current?.blur()
		} else if (event.key === 'Escape') {
			setClickedLayer(null)
			setClickedLayerName('')
			inputRef.current?.blur()
		}
	}
	const [canvasSize, setCanvasSize] = useState({ width: 2000, height: 2000 })
	const canvasContainerRef = useRef<HTMLDivElement>(null)
	const handleScroll = () => {
		if (canvasContainerRef.current) {
			const {
				scrollTop,
				scrollHeight,
				clientHeight,
				scrollLeft,
				scrollWidth,
				clientWidth,
			} = canvasContainerRef.current
			const nearBottom = scrollTop + clientHeight >= scrollHeight - 100
			const nearRight = scrollLeft + clientWidth >= scrollWidth - 100

			if (nearBottom || nearRight) {
				setCanvasSize(prevSize => ({
					width: nearRight ? prevSize.width + 1000 : prevSize.width,
					height: nearBottom ? prevSize.height + 1000 : prevSize.height,
				}))
			}
		}
	}
	useEffect(() => {
		const canvasContainer = canvasContainerRef.current
		if (canvasContainer) {
			canvasContainer.addEventListener('scroll', handleScroll)
			return () => {
				canvasContainer.removeEventListener('scroll', handleScroll)
			}
		}
	}, [])

	const DimensionViewable = {
		name: 'dimensionViewable',
		props: [],
		events: [],
		render(moveable: MoveableManagerInterface) {
			const rect = moveable.getRect()
			return (
				<div
					key={'dimension-viewer'}
					className={'moveable-dimension'}
					style={{
						position: 'absolute',
						left: `${rect.width / 2}px`,
						top: `${rect.height + 20}px`,
						background: '#4af',
						opacity: 0.9,
						borderRadius: '2px',
						padding: '2px 4px',
						color: 'white',
						fontSize: '13px',
						whiteSpace: 'nowrap',
						fontWeight: 'bold',
						willChange: 'transform',
						transform: `translate(-50%, 0px)`,
					}}>
					{Math.round(rect.width)} x {Math.round(rect.height)}
				</div>
			)
		},
	} as const

	const [canvasOptions, setCanvasOptions] = useState<ICanvasOptions>(() => {
		const savedCanvasOptions = localStorage.getItem('canvasOptions')
		return savedCanvasOptions
			? JSON.parse(savedCanvasOptions)
			: {
					rotatable: true,
					keepRatio: true,
					scalable: true,
					draggable: true,
			  }
	})

	useEffect(() => {
		localStorage.setItem('canvasOptions', JSON.stringify(canvasOptions))
	}, [canvasOptions])

	return (
		<div className='grid grid-cols-9 grid-rows-7 w-full h-full bg-custom-gray-3 relative'>
			<div className='flex flex-col w-full h-32 z-[50000] fixed bg-custom-gray-1 drop-shadow-lg p-2'>
				<h1 className='text-sm font-semibold'>Draw Me A Component by MOST </h1>
				<div
					role='tablist'
					className='tabs tabs-sm tabs-bordered'>
					<input
						type='radio'
						name='my_tabs_1'
						role='tab'
						className='tab mr-2 mb-0.5'
						aria-label='Canvas'
						defaultChecked
					/>
					<div
						role='tabpanel'
						className='tab-content w-full p-1'>
						<div className='flex gap-3 items-center'>
							<div className='form-control p-0.5 bg-custom-gray-2 rounded-md w-16 h-fit'>
								<label className='label cursor-pointer flex flex-col-reverse'>
									<span className='label-text text-xs'>
										<span className='underline'>S</span>calable
									</span>
									<input
										type='checkbox'
										className='toggle toggle-xs [--tglbg:#21252b]'
										checked={canvasOptions.scalable}
										onChange={e => {
											setCanvasOptions({
												...canvasOptions,
												scalable: e.target.checked,
											})
										}}
									/>
								</label>
							</div>
							<div className='form-control p-0.5 bg-custom-gray-2 rounded-md w-16'>
								<label className='label cursor-pointer flex flex-col-reverse'>
									<span className='label-text text-xs'>
										<span className='underline'>R</span>otatable
									</span>
									<input
										type='checkbox'
										className='toggle toggle-xs [--tglbg:#21252b]'
										checked={canvasOptions.rotatable}
										onChange={e => {
											setCanvasOptions({
												...canvasOptions,
												rotatable: e.target.checked,
											})
										}}
									/>
								</label>
							</div>
							<div className='form-control p-0.5 bg-custom-gray-2 rounded-md'>
								<label className='label cursor-pointer flex flex-col-reverse'>
									<span className='label-text text-xs'>
										<span className='underline'>D</span>raggable
									</span>
									<input
										type='checkbox'
										className='toggle toggle-xs [--tglbg:#21252b]'
										checked={canvasOptions.draggable}
										onChange={e => {
											setCanvasOptions({
												...canvasOptions,
												draggable: e.target.checked,
											})
										}}
									/>
								</label>
							</div>
							<div className='form-control p-0.5 bg-custom-gray-2 rounded-md'>
								<label className='label cursor-pointer flex flex-col-reverse'>
									<span className='label-text text-xs'>
										<span className='underline'>K</span>eep Radio
									</span>
									<input
										type='checkbox'
										className='toggle toggle-xs [--tglbg:#21252b]'
										checked={canvasOptions.keepRatio}
										onChange={e => {
											setCanvasOptions({
												...canvasOptions,
												keepRatio: e.target.checked,
											})
										}}
									/>
								</label>
							</div>
						</div>
					</div>

					<input
						type='radio'
						name='my_tabs_1'
						role='tab'
						className='tab mr-2 mb-0.5'
						aria-label='Insert'
					/>
					<div
						role='tabpanel'
						className='tab-content'>
						Tab content Insert
					</div>

					<input
						type='radio'
						name='my_tabs_1'
						role='tab'
						className='tab mr-2 mb-0.5'
						aria-label='View'
					/>
					<div
						role='tabpanel'
						className='tab-content'>
						Tab content View
					</div>
					{targets.length > 0 && (
						<>
							<input
								type='radio'
								name='my_tabs_1'
								role='tab'
								className='tab mr-2 mb-0.5 font-bold text-blue-300'
								aria-label='Component'
							/>
							<div
								role='tabpanel'
								className='tab-content'>
								Tab content Component
							</div>
						</>
					)}
				</div>
			</div>
			<div className='col-span-7 row-span-6 relative mt-32'>
				<div
					className='w-full h-full overflow-scroll'
					ref={canvasContainerRef}>
					<div
						ref={canvasRef}
						onDrop={handleOnDrop}
						onDragOver={e => e.preventDefault()}
						style={{ width: canvasSize.width, height: canvasSize.height }}
						className='paper relative elements'>
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
									zIndex: c.zIndex,
									opacity: c.visible ? 1 : 0,
								}}
								id={c.id}
								key={i}>
								<img
									draggable={false}
									src={c.component.dataUrl}
									alt={c.component.name}
									className='size-auto object-contain p-2'
								/>
							</div>
						))}

						<Moveable
							ref={moveableRef}
							target={targets}
							ables={[DimensionViewable]}
							draggable={canvasOptions.draggable}
							scalable={canvasOptions.scalable}
							scrollable={true}
							scrollOptions={{
								container: canvasContainerRef,
								threshold: 30,
								checkScrollEvent: false,
								throttleTime: 0,
							}}
							props={{
								dimensionViewable: true,
							}}
							rotatable={canvasOptions.rotatable}
							throttleScale={0}
							keepRatio={canvasOptions.keepRatio}
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
							onScroll={({ scrollContainer, direction }) => {
								scrollContainer.scrollBy(direction[0] * 10, direction[1] * 10)
							}}
							onScrollGroup={({ targets, scrollContainer, direction }) => {
								targets.forEach(target => {
									target.style.transform = `translate(${direction[0]}px, ${direction[1]}px) ${target.style.transform}`
								})
								scrollContainer.scrollBy(direction[0] * 10, direction[1] * 10)
							}}
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
						<div className='w-fit h-[85%] max-h-fit bg-custom-gray-3 p-2 drop-shadow-lg overflow-auto border-custom-gray-2 border-2 rounded-lg absolute bottom-7 left-2 z-[1000000]'>
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
						<div className='text-start text-sm font-bold absolute top-5 left-2 bg-custom-gray-3 p-2 drop-shadow-lg border-custom-gray-2 border-2 rounded-lg truncate max-w-fit w-72 z-[1000000]'>
							{selectedCategory.name}
						</div>
					</>
				)}
			</div>
			<div className='col-span-2 row-span-7 bg-custom-gray-1 mt-32'>
				<div className='flex flex-col w-full h-full items-center gap-2 p-2'>
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
					<p className='text-start w-full font-bold'>Layers</p>
					<div className='w-full h-1/2 bg-custom-gray-2 rounded-lg'>
						<List
							lockVertically
							values={canvasComponents}
							onChange={({ oldIndex, newIndex }) => {
								const updatedComponents = arrayMove(
									canvasComponents,
									oldIndex,
									newIndex
								).map((component, index, array) => ({
									...component,
									zIndex: array.length - index, // Asigna un zIndex más alto a los elementos más arriba en la lista
								}))
								setCanvasComponents(updatedComponents)
							}}
							renderList={({ children, props }) => (
								<ul
									className='h-full gap-1 p-1 overflow-auto'
									{...props}>
									{children}
								</ul>
							)}
							renderItem={({ value, props, isDragged }) => (
								<div
									className={
										'flex gap-2 items-center p-2 z-50 rounded-md transition-colors ease-linear duration-150' +
										(targets.map(t => t.id).includes(value.id) || isDragged
											? ' bg-custom-gray-3'
											: ' bg-transparent')
									}
									{...props}>
									<button
										data-movable-handle
										className='btn btn-square btn-xs bg-custom-gray-3 border-none hover:bg-custom-gray-3'
										style={{
											cursor: isDragged ? 'grabbing' : 'grab',
										}}
										tabIndex={-1}>
										<span className='icon-[pixelarticons--menu] size-5 flex-none'></span>
									</button>
									<label className='swap'>
										<input
											onChange={() => {
												const updatedCanvasComponents = canvasComponents.map(
													c =>
														c.id === value.id
															? { ...c, visible: !c.visible }
															: c
												)
												setCanvasComponents(updatedCanvasComponents)
											}}
											type='checkbox'
										/>
										<span
											className={
												value.visible
													? `icon-[pixelarticons--eye]`
													: `icon-[pixelarticons--eye-closed]`
											}></span>
									</label>
									<button
										onClick={() => {
											const targetElement = document.getElementById(value.id)
											if (targets.map(t => t.id).includes(value.id)) {
												setTargets(targets.filter(t => t.id !== value.id))
											} else {
												setTargets([document.getElementById(value.id)!])
												if (targetElement) {
													targetElement.scrollIntoView({
														behavior: 'smooth',
														block: 'center',
													})
												}
											}
										}}
										className='bg-custom-gray-3/50 w-10 rounded-lg p-1 size-10 flex-none'
										style={{
											border: targets.map(t => t.id).includes(value.id)
												? '2px solid rgb(59 130 246)'
												: '2px solid transparent',
											boxSizing: 'border-box',
										}}>
										<img
											draggable={false}
											src={value.component.dataUrl}
											alt={value.component.name}
											className='size-full object-contain'
										/>
									</button>
									<button
										className='w-56'
										onDoubleClick={() => {
											setClickedLayer(value)
											setClickedLayerName(value.layerName)
										}}>
										{clickedLayer?.id === value.id ? (
											<div
												title={value.layerName}
												className='w-full h-fit'>
												<input
													onChange={e => {
														setClickedLayerName(e.target.value)
													}}
													ref={inputRef}
													type='text'
													placeholder='layer name'
													value={clickedLayerName}
													className='input input-bordered input-sm w-full max-w-xs bg-custom-gray-1 text-xs'
													onKeyDown={handleKeyDownInput}
												/>
											</div>
										) : (
											<p
												title={value.layerName}
												className='truncate text-xs w-full text-start font-bold'>
												{value.layerName}
											</p>
										)}
									</button>
									{/* TODO: DO THIS ON A R-CLICK MENU */}
									{/* <button
													className='btn btn-square btn-xs bg-custom-gray-3 hover:bg-custom-gray-3 border-none text-xl'
													onClick={() => {
														setCanvasComponents(
															canvasComponents.filter(
																component => component.id !== value.id
															)
														)
														setTargets(targets.filter(t => t.id !== value.id))
													}}>
													<span className='icon-[pixelarticons--trash-alt]'></span>
												</button> */}
								</div>
							)}
						/>
					</div>
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
					className='absolute rounded-lg bg-custom-gray-3 border-2 border-custom-gray-2 shadow-lg z-[1000001]'
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
