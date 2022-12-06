import React from 'react';
import { categories } from '../../utils/categories';

import { 
	Container,
	Title,
	Amount,
	Footer,
	Category,
	Icon,
	CategoryName,
	Date
} from './styles';

export interface TransactionCardProps {
	data: {
		type: 'positive' | 'negative';
		name: string;
		amount: string;
		categoryKey: string;
		date: Date;
	}
}

export function TransactionCard({ data: {type, name, amount, categoryKey, date} }: TransactionCardProps) {
	const [ category ] = categories.filter(
		item => item.key === categoryKey
	);

	return (
		<Container>
			<Title>
				{name}
			</Title>
			<Amount type={type}>
				{type === 'negative' && '- ' }
				{amount}
			</Amount>

			<Footer>
				<Category>
					<Icon name={category.icon} />

					<CategoryName>
						{category.name}
					</CategoryName>
				</Category>
				
				<Date>
					{date}
				</Date>
			</Footer>
		</Container>
	)
}