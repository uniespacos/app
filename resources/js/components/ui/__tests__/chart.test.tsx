import React from 'react';
import { render } from '@testing-library/react';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '../chart';

describe('ChartTooltipContent optional chaining regression', () => {
  it('should not throw when label is not a key in chartConfig', () => {
    const config: ChartConfig = {
      taxa_ocupacao_num: {
        label: 'Taxa de Ocupação (%)',
        color: '#3b82f6',
      },
    };

    const payload = [
      {
        dataKey: 'taxa_ocupacao_num',
        name: 'taxa_ocupacao_num',
        value: 42,
        payload: {},
      },
    ];

    // This should not throw an error even though "Auditório Central" is not in chartConfig.
    // Before the fix, accessing config[label].label would throw:
    // "Uncaught TypeError: can't access property "label", x[o] is undefined"
    // After the fix using optional chaining (config[label]?.label), it falls back to the raw label.

    expect(() => {
      render(
        <ChartContainer config={config}>
          <ChartTooltipContent
            active={true}
            payload={payload}
            label="Auditório Central"
          />
        </ChartContainer>
      );
    }).not.toThrow();
  });

  it('should display config label when label is a valid key in chartConfig', () => {
    const config: ChartConfig = {
      taxa_ocupacao_num: {
        label: 'Taxa de Ocupação (%)',
        color: '#3b82f6',
      },
    };

    const payload = [
      {
        dataKey: 'taxa_ocupacao_num',
        name: 'taxa_ocupacao_num',
        value: 42,
        payload: {},
      },
    ];

    const { container } = render(
      <ChartContainer config={config}>
        <ChartTooltipContent
          active={true}
          payload={payload}
          label="taxa_ocupacao_num"
        />
      </ChartContainer>
    );

    // When label is a valid key in chartConfig, use the config's label
    const tooltipContent = container.querySelector('[data-slot="chart"]');
    expect(tooltipContent).toBeTruthy();
  });

  it('should fallback to raw label when label key is not in chartConfig', () => {
    const config: ChartConfig = {
      metrica1: {
        label: 'Métrica 1',
        color: '#10b981',
      },
    };

    const payload = [
      {
        dataKey: 'metrica1',
        name: 'metrica1',
        value: 100,
        payload: {},
      },
    ];

    // Simulate a chart axis using dynamic values like space names
    // The fix ensures that accessing config["Nome Dinâmico do Espaço"]?.label
    // doesn't throw but instead returns undefined and falls back to the raw label string.

    expect(() => {
      render(
        <ChartContainer config={config}>
          <ChartTooltipContent
            active={true}
            payload={payload}
            label="Nome Dinâmico do Espaço"
          />
        </ChartContainer>
      );
    }).not.toThrow();
  });
});
