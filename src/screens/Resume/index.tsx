import React, { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator } from 'react-native';
import { VictoryPie } from "victory-native";
import { RFValue } from "react-native-responsive-fontsize";
import { addMonths, subMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { HistoryCard } from "../../components/HistoryCard";
import { useTheme } from 'styled-components';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../hooks/auth";

import { categories } from "../../utils/categories";

import {
	Container, 
	Header,
	Title,
	Content,
	ChartContainer,
	MonthSelect,
	MonthSelectButton,
	MonthSelectIcon,
	Month,
	LoadContainer
} from './styles';

interface TransactionData {
	data: {
		type: 'positive' | 'negative';
		name: string;
		amount: string;
		categoryKey: string;
		date: Date;
	}
}

interface CategoryData {
	key: string;
	name: string;
	total: number;
	totalFormatted: string;
	color: string;
	percent: string;
}

export function Resume() {
	const [isLoading, setIsLoading] = useState(false);
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [totalByCategories, setTotalByCategories] = useState<CategoryData[]>([]);

	const { user } = useAuth();
	const theme = useTheme();

	function handleDateChange(action: 'next' | 'prev') {
		if (action === 'next') {
			setSelectedDate(addMonths(selectedDate, 1));
		} else {
			setSelectedDate(subMonths(selectedDate, 1));
		}
	}

	async function loadData() {
		setIsLoading(true);
		const dataKey = `@gofinances:transactions_user:${user.id}`;
		const response = await AsyncStorage.getItem(dataKey);
		const responseFormatted = response ? JSON.parse(response) : [];

		const expensives = responseFormatted.filter(
			(expensive: TransactionData) => 
			expensive.data.type === 'negative' &&
			new Date(expensive.data.date).getMonth() === selectedDate.getMonth() &&
			new Date(expensive.data.date).getFullYear() === selectedDate.getFullYear()
		);

		const expensivesTotal = expensives.reduce(
			(acumullator: number, expensive: TransactionData) => {
				return acumullator + Number(expensive.data.amount);
			}, 0);

		const totalByCategory: CategoryData[] = [];

		categories.forEach(category => {
			let categorySum = 0;

			expensives.forEach((expensive: TransactionData) => {
				if (expensive.data.categoryKey === category.key) {
					categorySum += Number(expensive.data.amount);
				}
			});

			if (categorySum > 0) {
				const totalFormatted = categorySum.toLocaleString(
					'pt-BR', {
						style: 'currency',
						currency: 'BRL'
					}
				);

				const percent = `${(categorySum / expensivesTotal * 100).toFixed(0)}%`;
				
				totalByCategory.push({
					key: category.key,
					color: category.color,
					name: category.name,
					total: categorySum,
					totalFormatted,
					percent
				});
			}
		});

		setTotalByCategories(totalByCategory);
		setIsLoading(false);
	}

	useFocusEffect(useCallback(() => {
		loadData();
	}, [selectedDate]));

	return (
		<Container>
			
			<Header>
				<Title>Resumo por categoria</Title>
			</Header>

			{
				isLoading ? 
					<LoadContainer>
						<ActivityIndicator 
							color={theme.colors.primary}
							size="large"
						/>
					</LoadContainer> 
				: 
					<Content
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{
							paddingHorizontal: 24,
							paddingBottom: useBottomTabBarHeight(),
						}}
					>

					<MonthSelect>
						<MonthSelectButton onPress={() => handleDateChange('prev')}>
							<MonthSelectIcon name="chevron-left"/>
						</MonthSelectButton>	

						<Month>
							{ format(selectedDate, 'MMMM, yyyy', {locale: ptBR}) }
						</Month>

						<MonthSelectButton onPress={() => handleDateChange('next')}>
							<MonthSelectIcon name="chevron-right"/>
						</MonthSelectButton>
					</MonthSelect>	
					
					<ChartContainer>
						<VictoryPie
							data={totalByCategories}
							colorScale={totalByCategories.map(category => category.color)}
							style={{
								labels: { 
									fontSize: RFValue(18),
									fontWeight: 'bold',
									fill: theme.colors.shape
								}
							}}
							labelRadius={50}
							x="percent"
							y="total"
						/>
					</ChartContainer>

						{
							totalByCategories.map(item => (
								<HistoryCard 
									key={item.key}
									color={item.color}
									title={item.name}
									amount={item.totalFormatted}
								/>
							))
						}
					</Content>	
			}	
		</Container>
	)
}