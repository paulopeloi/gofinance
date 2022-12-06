import React from 'react';
import { RectButtonProps } from 'react-native-gesture-handler';
import { 
	Container,
	TransactionButton,	
	Icon,
	Title
} from './styles';

const icons = {
	up: 'arrow-up-circle',
	down: 'arrow-down-circle'
}

interface Props extends RectButtonProps {
	type: 'up' | 'down';
	title: string;
	isActive: boolean;
	onPress: () => void;
}

export function TransactionTypeButton({
	title,
	type,
	isActive,
	...rest
}: Props){
	return (
		<Container 
			type={type}
			isActive={isActive}
		>
			<TransactionButton
				{...rest}
			>
				<Icon 
					name={icons[type]}
					type={type}
				/>
				<Title>
					{title}
				</Title>
			</TransactionButton>
		</Container>	
	)
}