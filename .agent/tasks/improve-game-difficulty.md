# Melhorias no Sistema de Dificuldade e Modo Treino

## 📋 Objetivos

1. ✅ **Anti-repetição**: Não repetir cálculos durante uma sessão
2. ✅ **Dificuldade progressiva no treino**: Aplicar mesma lógica de tier no modo treino
3. ✅ **Opção de tempo no treino**: Permitir treinar com ou sem limite de tempo
4. ✅ **Alertas de tempo**: Avisos visuais e sonoros quando tempo estiver acabando

## 🔧 Implementação

### 1. Sistema Anti-Repetição (mathGenerator.ts)
- Criar histórico de questões geradas
- Verificar se questão já foi gerada antes de retornar
- Limitar tentativas para evitar loop infinito
- Usar hash da questão (texto) como identificador único

### 2. Modo Treino com Dificuldade Progressiva (App.tsx)
- Adicionar contador de questões no modo treino
- Calcular tier baseado no número de questões respondidas
- Aumentar dificuldade a cada 5-10 questões corretas

### 3. Opção de Tempo no Treino (HomeView.tsx + App.tsx)
- Adicionar toggle "Treinar com tempo" na HomeView
- Passar parâmetro `timedTraining` para `startLevel`
- Aplicar tempo se `timedTraining === true`

### 4. Alertas de Tempo (GameView.tsx + audioService.ts)
- Adicionar efeito visual quando `timeLeft <= 5`
- Tocar som de alerta aos 5 segundos
- Pulsar borda vermelha e ícone de tempo
- Adicionar som de "tick-tock" nos últimos 3 segundos

## 📁 Arquivos a Modificar

1. `src/services/mathGenerator.ts` - Anti-repetição
2. `src/App.tsx` - Lógica de treino progressivo e tempo opcional
3. `src/views/HomeView.tsx` - Toggle de tempo no treino
4. `src/views/GameView.tsx` - Alertas visuais de tempo
5. `src/services/audioService.ts` - Sons de alerta

## 🎯 Critérios de Sucesso

- [ ] Nenhuma questão se repete durante uma sessão
- [ ] Modo treino aumenta dificuldade progressivamente
- [ ] Toggle "Treinar com tempo" funciona corretamente
- [ ] Alerta visual aparece aos 5 segundos
- [ ] Som de alerta toca aos 5 segundos
- [ ] Interface pulsa nos últimos segundos
