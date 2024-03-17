import React, { useEffect, useRef, useState } from 'react';
import '@vkontakte/vkui/dist/vkui.css';
import { View, Panel, PanelHeader, Group, Button, Textarea, Spinner} from '@vkontakte/vkui';
import { useQuery } from '@tanstack/react-query';
import { CatFactUrl } from '../../shared/api/base';

// Тип данных для факта о котах
interface CatFact {
   data: object | null,
   fact: string;
  }
  
const CatFactComponent: React.FC = () => {
    // Состояние для хранения факта о котах
  const [catFact, setCatFact] = useState<string | undefined>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Функция для получения факта о котах
  const fetchCatFact = async (): Promise<void> => {
    const response = await fetch(CatFactUrl);
    const data: CatFact = await response.json();
    setCatFact(data.fact);
  }

  // Устанавливаем курсор после первого слова
  useEffect(() => {
      if (textareaRef.current) {
          const firstWordEndIndex: number | undefined = catFact?.indexOf(' ');
          // Находим индекс конца первого слова
          if (firstWordEndIndex !== 0 && firstWordEndIndex!== undefined ) {
              textareaRef.current.setSelectionRange(firstWordEndIndex, firstWordEndIndex); 
              textareaRef.current.focus(); // Устанавливаем фокус на поле после получения факта
            }
        }
    }, [catFact]);

  //  Хук для выполнения запроса 
  const { isLoading, isError } = useQuery( {
      queryKey: ['catFact'],
      queryFn: () => fetchCatFact,
      enabled: false,
    });

  // Обработка загрузки данных
  if (isLoading) return <div><Spinner size="small" /></div>;

  // Обработка ошибки
  if (isError) {
      return <div>Error!</div>;
    }  

  return (
    <View activePanel="cat">
      <Panel id="cat">
        <PanelHeader>Task</PanelHeader>
        <Group>
              <Button 
                  onClick={fetchCatFact} 
                  size="m"
                  type="button"
                  hasHover 
              >
                  Получить факт о котах
              </Button>
            <Textarea
              value={catFact}
              getRef={textareaRef}
              style={{ margin: "20px 0" }}
            />
        </Group>
      </Panel>
    </View>
  );
};

export default CatFactComponent;
