import React from 'react';
import 'react-testing-library/cleanup-after-each';
import { render } from 'react-testing-library';
import Karhu from '../karhu/Karhu';
import { KarhuComponent, KarhuProvider, AddCommand } from './index';

test('renders children', () => {
  const karhu = new Karhu();
  const MyComp = <h1>hello</h1>;
  const { getByText } = render(
    <KarhuProvider value={karhu}>
      <KarhuComponent input="">
        {() => {
          return MyComp;
        }}
      </KarhuComponent>
    </KarhuProvider>,
  );

  expect(getByText('hello')).toBeDefined();
});

test('updates matching command list when prop input changes', () => {
  // Given
  const karhu = new Karhu();
  const command1 = Karhu.createCommand({
    id: 'c1',
    name: 'first-command',
    keywords: ['first command'],
    actions: {
      onExec: jest.fn(),
    },
    render: c => {
      return command1.name;
    },
  });
  const command2 = Karhu.createCommand({
    id: 'c2',
    name: 'second-command',
    keywords: ['second command'],
    actions: {
      onExec: jest.fn(),
    },
    render: c => {
      return command2.name;
    },
  });
  const MyComp = (props: any) => (
    <div>
      <h1>hello</h1>
      {props.children}
    </div>
  );
  let commandsListList = [];
  const tree = (props: any) => {
    return (
      <KarhuProvider value={karhu}>
        <AddCommand command={command1} />
        <AddCommand command={command2} />
        <KarhuComponent input={props.input}>
          {({ commandsList }) => {
            return (
              <MyComp>
                {commandsList.map(c => (
                  <li data-testid="command-list-item" key={c.id}>
                    {c.name}
                  </li>
                ))}
              </MyComp>
            );
          }}
        </KarhuComponent>
      </KarhuProvider>
    );
  };

  // When
  const { getByText, queryByText, getByTestId, queryByTestId, rerender } = render(tree({ input: '' }));

  // Then
  // No input set
  expect(queryByTestId('command-list-item')).toBeNull();

  // When
  rerender(tree({ input: 'fir' }));

  // Then
  // Match first command
  expect(getByTestId('command-list-item')).not.toBeNull();
  expect(getByText('first-command')).not.toBeUndefined();
  expect(queryByText('second-command')).toBeNull();

  // When
  rerender(tree({ input: 'secon' }));

  // Then
  // Match second command
  expect(getByTestId('command-list-item')).not.toBeNull();
  expect(queryByText('first-command')).toBeNull();
  expect(getByText('second-command')).not.toBeUndefined();

  // When
  rerender(tree({ input: 'comma' }));

  // Then
  // Match both
  expect(getByTestId('command-list-item')).not.toBeNull();
  expect(getByText('first-command')).not.toBeUndefined();
  expect(getByText('second-command')).not.toBeUndefined();

  // When
  rerender(tree({ input: 'third' }));

  // Then
  // Match none
  expect(queryByTestId('command-list-item')).toBeNull();
  expect(queryByText('first-command')).toBeNull();
  expect(queryByText('second-command')).toBeNull();
});
