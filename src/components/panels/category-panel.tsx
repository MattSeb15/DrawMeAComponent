import { Category, Component } from '../../interfaces/panels/draw-me-panel'

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

export default CategoryPanel
