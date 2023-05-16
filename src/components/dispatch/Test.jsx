import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend'

const ItemTypes = {
  CARD: 'card',
};

const App = () => {
  const [lists, setLists] = useState([
    { id: 1, name: 'School One', items: ['Apple', 'Banana', 'Cherry'] },
    { id: 2, name: 'School Two', items: ['Durian', 'Elderberry', 'Fig'] },
  ]);

  const Card = ({ id, name, listId }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: ItemTypes.CARD,
      item: { id, name, listId },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }));

    return (
      <div
        ref={drag}
        style={{
          opacity: isDragging ? 0.5 : 1,
          cursor: 'move',
          backgroundColor: 'lightgray',
          padding: '10px',
          margin: '10px',
        }}
      >
        {name}
      </div>
    );
  };

  const List = ({ list, listId }) => {
    const [, drop] = useDrop(() => ({
      accept: ItemTypes.CARD,
      drop: (item) => {
        const { id, name, listId: prevListId } = item;
        if (prevListId !== listId) {
          const updatedLists = [...lists];
          const newListIndex = updatedLists.findIndex((l) => l.id === listId);
          const prevListIndex = updatedLists.findIndex((l) => l.id === prevListId);
          const updatedItems = [...updatedLists[prevListIndex].items.filter((item) => item.id !== id)];

          updatedLists[prevListIndex] = {
            ...updatedLists[prevListIndex],
            items: updatedItems,
          };
          updatedLists[newListIndex] = {
            ...updatedLists[newListIndex],
            items: [...updatedLists[newListIndex].items, { id, name }],
          };

          setLists(updatedLists);
        }
      },
    }));

    return (
      <div
        ref={drop}
        style={{
          backgroundColor: 'white',
          padding: '10px',
          margin: '10px',
          minHeight: '100px',
        }}
      >
        {list.items.map((item) => (
          <Card key={item.id} {...item} listId={listId} />
        ))}
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App">
        {lists.map((list) => (
          <div key={list.id}>
            <h2>{list.name}</h2>
            <List list={list} listId={list.id} />
          </div>
        ))}
      </div>
    </DndProvider>
  );
};

export default App;
