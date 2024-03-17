// import { useQuery } from "react-query";
import '@vkontakte/vkui/dist/vkui.css';
// import { AgeForm } from "../../types";
import { Button, FormItem, Group,  Panel, Spinner, Text, View } from "@vkontakte/vkui";
import {  SubmitHandler, useForm} from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useRef, useState } from 'react';
import { Icon24ChecksOutline} from '@vkontakte/icons';
import { useQuery } from '@tanstack/react-query';
import { AgifyApiUrl } from '../../../shared/api/base';
    
const AgeComponent: React.FC = () => {

  const validationSchema = yup.object().shape({
    name: yup
        .string()
        .matches(/^[a-zA-Zа-яА-Я]+$/, 'Имя может состоять только из букв')
        .test('unique', 'Это имя уже было отправлено', function (value) {
            return value !== previousName;
          })
        .required('Введите имя'),
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm({mode: 'onChange',resolver: yupResolver(validationSchema)});
  const [ageUser ,setAgeUser] = useState<string>('');
  const [previousName, setPreviousName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false); // Флаг для отслеживания статуса отправки запроса
  const [nameValue, setNameValue] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isErr, setIsErr] = useState<string>('');
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if(nameValue&&(submitted==false)){
      const timer = setTimeout(() => {
        handleAgeSubmit({ name: nameValue });
      }, 3000);
      return () => clearTimeout(timer);
    } 
    setSubmitted(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameValue, setNameValue]);

  const { error, isLoading } = useQuery({
      queryKey: ['age'],
      queryFn: async() => handleAgeSubmit,
      enabled: true,
      retry: false,
    });
  
  const handleAgeSubmit:SubmitHandler<{ name: string }> = async (data) => {
    console.log(data,nameValue);
    setIsErr('');
    setLoading(true);
    try {
      const url = `${AgifyApiUrl}?name=${nameValue}`
      await validationSchema.validate(data, { abortEarly: false });

        // Проверка, не выполняется ли уже запрос
      if (isLoading) {
        console.log('Запрос уже выполняется');
        return;
      }
      
      setLoading(true); // Устанавливаем флаг отправки запроса

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const dataAge = await response.json();
      console.log(dataAge);
      setAgeUser(dataAge.age);
      reset();
      setPreviousName(nameValue);// Запоминаем предыдущее имя
      
    } catch (error) {
        if(error instanceof Error){
          setIsErr(error?.message)
            console.log(error?.message);
            console.log(errors)
          }         
    } 
    finally {
      setLoading(false);// Сбрасываем флаг отправки запроса
    }
  };

  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.value = nameValue;
    }
  }, [nameValue]);
      
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const handleClick = () => {
    if (!loading) {
      setSubmitted(true);
      handleAgeSubmit({ name: nameValue }); 
    }
};

  return (
    <View activePanel="age">
      <Panel id="age">
        {/* <PanelHeader>Возраст по имени</PanelHeader> */}
        <Group about="Возраст по имени">
          <form onSubmit={handleSubmit(handleAgeSubmit)}>
            <FormItem bottom="Имя может содержать только латинские и русские буквы." style={{ display: 'flex', flexDirection:'column' }}>
              <input 
                type="text"
                placeholder="Введите ваше имя" 
                
                style={{ marginBottom: "20px" }}                     
                {...register('name')}
                // value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                ref={nameInputRef}
                />

              {(isErr||errors) && <Text style={{ color: 'red', marginBottom: "20px" }}>{isErr||errors.name?.message}</Text>}
              <Button
                  size="l" 
                  type="submit"
                  after={<Icon24ChecksOutline/>}
                  onClick={handleClick}
                  disabled={loading || submitted}
                >
                  Получить возраст
                </Button>
              </FormItem> 
          </form>
              {loading && <Spinner size="large" style={{ margin: '20px auto' }} />}
              <div style={{ padding: 18 }}><Text>Возраст: {ageUser}</Text></div>
        </Group>
      </Panel>
    </View>
  );
};
      
export default AgeComponent;


