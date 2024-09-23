import { Category, Component } from '../../interfaces/panels/draw-me-panel'

const CategoryItem: React.FC<
	{
		className?: string
		category: Category
		components: Component[]
		selected: boolean
		onSelectCategory: (category: Category) => void
	} & React.HTMLProps<HTMLDivElement>
> = ({
	category,
	components,
	onSelectCategory,
	selected,
	className,
	...divProps
}) => {
	return (
		<div
			className={`indicator w-fit h-fit ` + className}
			onClick={() => onSelectCategory(category)}
			{...divProps}>
			<span className='indicator-item badge indicator-start indicator-bottom bg-custom-gray-3 border border-custom-gray-1 text-white font-bold'>
				{components.length}
			</span>
			<div
				className={
					'btn m-1 border-none' +
					(selected
						? category.id === '0'
							? ' bg-amber-500/80 hover:bg-amber-500/50'
							: ' bg-blue-700 hover:bg-blue-800'
						: category.id === '0'
						? ' bg-amber-500/10 hover:bg-amber-500/50'
						: ' bg-custom-gray-1 hover:bg-custom-gray-3')
				}>
				<p className='w-36 truncate'>{category.name}</p>
			</div>
		</div>
	)
}

export const ComponentPanel: React.FC<
	{
		component: Component
		categoryName?: string
		onDragComponentStart?: (
			e: React.DragEvent<HTMLDivElement>,
			component: Component
		) => void
	} & React.HTMLProps<HTMLDivElement>
> = ({ component, categoryName, onDragComponentStart, ...props }) => {
	return (
		<div
			draggable
			onDragStart={e =>
				onDragComponentStart && onDragComponentStart(e, component)
			}
			className='flex-none size-32 bg-custom-gray-2 rounded-lg relative'
			{...props}>
			<div className='absolute w-full top-1 px-1 flex justify-center'>
				<p className='font-medium w-fit text-xs text-center px-2 bg-custom-gray-3/80 rounded truncate'>
					{component.name}
				</p>
			</div>
			{categoryName && (
				<div className='absolute w-full bottom-1 px-1 flex justify-center'>
					<p className='font-bold w-fit text-sm text-center px-2 bg-custom-gray-2 border-2 border-custom-gray-3  rounded truncate'>
						{categoryName}
					</p>
				</div>
			)}
			<DraggableComponentImg
				component={component}
				/* onDragStart={e => onDragImgStart && onDragImgStart(e, component)} */
			/>
		</div>
	)
}

export const DraggableComponentImg: React.FC<
	{
		component: Component
	} & React.HTMLProps<HTMLImageElement>
> = ({ component, ...props }) => {
	return (
		<div className='w-full h-full flex items-center justify-center'>
			<img
				draggable={false}
				id={component.id}
				src={component.dataUrl}
				alt={component.name}
				className='size-auto max-h-20 object-contain rounded-t-xl'
				{...props}
			/>
		</div>
	)
}

export default CategoryItem
