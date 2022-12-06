import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect } from '@react-navigation/native';  
import { useTheme } from 'styled-components';
import { useAuth } from '../../hooks/auth';
import { HighlightCard } from '../../components/HighlightCard';
import { TransactionCard, TransactionCardProps } from '../../components/TransactionCard';

import { 
	Container, 
	Header,
	UserWrapper,
	UserInfo,
	Photo,
	User,
	UserGreeting,
	UseName,
	Icon,
	HighlightCards,
	Transactions,
	Title,
	TransactionList,
	LogoutButton,
	LoadContainer
} from './styles';


export interface DataListProps extends TransactionCardProps {
	id: string;
}

interface HighlightProps {
	amount: string;
	lastTransaction: string;
}

interface HighlightData {
	entries: HighlightProps,
	expensives: HighlightProps,
	total: HighlightProps
}

export function Dashboard() {
	const [isLoading, setIsLoading] = useState(true);
	const [transactions, setTransactions] = useState<DataListProps[]>([]);
	const [highlightData, setHighlightData] = useState<HighlightData>({} as HighlightData);

	const theme = useTheme();
	const { signOut, user } = useAuth();

	function getLastTransactionDate(
		collection: DataListProps[], 
		type: 'positive' | 'negative'
	){
		const collectionFilttered = collection.filter(transaction => transaction.data.type === type);

		if(collectionFilttered.length === 0) {
			return 0
		}

		const lastTransactions = new Date (
			Math.max.apply(Math, collectionFilttered
				.map(transaction => new Date(transaction.data.date).getTime()))
		);
		
		return `${lastTransactions.getDate()} de ${lastTransactions.toLocaleString('pt-BR', {month: 'long'})}`
	}

	async function loadTransactios() {
		const dataKey = `@gofinances:transactions_user:${user.id}`;
		const response = await AsyncStorage.getItem(dataKey).catch((error) => { console.log(error) });
		const transactions = response ? JSON.parse(response) : [];

		let entriesTotal = 0;
		let expensiveTotal = 0;

		const transactionsFormatted: DataListProps[] = transactions.map((item: DataListProps) => {
				if(item.data.type === 'positive'){
					entriesTotal += Number(item.data.amount);
				} else {
					expensiveTotal += Number(item.data.amount);
				}

				const amount = Number(item.data.amount).toLocaleString('pt-BR', {
					style: 'currency',
					currency: 'BRL'
				});

				const date = Intl.DateTimeFormat('pt-BR', {
					day: '2-digit',
					month: '2-digit',
					year: '2-digit'
				}).format(new Date(item.data.date));

				return {
					id: item.id,
					data: {
						type: item.data.type,
						name: item.data.name,
						amount,
						categoryKey: item.data.categoryKey,
						date
					}
				}
			});
			
			setTransactions(transactionsFormatted);			

			const lasTransactionEntries = getLastTransactionDate(transactions, 'positive');
			const lasTransactionExpensives = getLastTransactionDate(transactions, 'negative');
			const totalInterval = lasTransactionExpensives === 0 ? `01 à 15` : `01 à ${lasTransactionExpensives}`;


			const total = entriesTotal - expensiveTotal;

			setHighlightData({
				entries: {
					amount: entriesTotal.toLocaleString('pt-BR', {
						style: 'currency',
						currency: 'BRL'
					}),
					lastTransaction: lasTransactionEntries === 0 ? 'Não há transações' : `Última entrada dia ${lasTransactionEntries}`
				},
				expensives: {
					amount: expensiveTotal.toLocaleString('pt-BR', {
						style: 'currency',
						currency: 'BRL'
					}),
					lastTransaction: lasTransactionExpensives === 0 ? 'Não há transações' : `Última saída dia ${lasTransactionExpensives}`
				},
				total: {
					amount: total.toLocaleString('pt-BR', {
						style: 'currency',
						currency: 'BRL'
					}),
					lastTransaction: totalInterval
				}
			});

			setIsLoading(false);
	}

	useEffect(() => {
		loadTransactios()
	}, [])

	useFocusEffect(useCallback(() => {
		loadTransactios();
	}, []));

	return ( 
		<Container> 
			{
				isLoading ? 
					<LoadContainer>
						<ActivityIndicator 
							color={theme.colors.primary}
							size="large"
						/>
					</LoadContainer> 
				: 
					<>
					<Header>
						<UserWrapper>
							<UserInfo>
								<Photo 
									source={{ uri: user.photo }}
								/>
								<User>
									<UserGreeting>Olá,</UserGreeting>
									<UseName>{user.name}</UseName>
								</User>
							</UserInfo>

							<LogoutButton onPress={signOut}>
								<Icon name="power"/>
							</LogoutButton>
						</UserWrapper>
					</Header>

					<HighlightCards>
						<HighlightCard
							type="up" 
							title="Entradas" 
							amount={highlightData.entries.amount} 
							lastTransaction={highlightData.entries.lastTransaction}
						/>
						<HighlightCard 
							type="down"
							title="Saída" 
							amount={highlightData.expensives.amount} 
							lastTransaction={highlightData.expensives.lastTransaction}
						/>
						<HighlightCard 
							type="total"
							title="Total" 
							amount={highlightData.total.amount}
							lastTransaction={highlightData.total.lastTransaction}
						/>
					</HighlightCards>	

					<Transactions>
						<Title>Listagem</Title>	
						<TransactionList 
							data={transactions}
							keyExtractor={item => item.id}
							renderItem={({ item }) => <TransactionCard data={item.data} />}
						/>
					</Transactions>			
					</>
			}
		</Container>
	)
}