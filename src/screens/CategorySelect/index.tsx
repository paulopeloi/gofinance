import React from 'react';
import { Button } from '../../components/Form/Button';
import { categories } from '../../utils/categories';

import { 
	Container,
	Header,
	Title,
	CategoryList,
	Category,
	Icon,
	Name,
	Separator,
	Footer
} from './styles';

interface Category {
	key: string;
	name: string;
}

interface Props {
	category: Category;
	setCategory: (category: Category) => void;
	closeSelectCategory: () => void;
}

export function CategorySelect({
	category,
	setCategory,
	closeSelectCategory
}: Props) {

	function handleCategorySelect(category: Category){
		setCategory(category);
	}

	return (
		<Container>
			<Header>
				<Title>
					Categoria
				</Title>
			</Header>

			<CategoryList
				data={categories}
				keyExtractor={(item) => item.key}
				renderItem={({ item }) => (
					<Category
						onPress={() => handleCategorySelect(item)}
						isActive={category.key === item.key}
					>
						<Icon name={item.icon} />
						<Name>{item.name}</Name>
					</Category>
				)}
				ItemSeparatorComponent={() => <Separator />}
			/>

			<Footer>
				<Button 
					title="Selecionar"
					onPress={closeSelectCategory}
				/>
			</Footer>
		</Container>
	)
}