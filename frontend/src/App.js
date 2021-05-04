import React, {useState, useRef, useEffect} from 'react';

const App = () => {
  const ws = useRef(null);
  const [state, setState] = useState({
    mouseDown: false,
    pixelsArray: []
  });

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8000/canvas');

    ws.current.onmessage = e => {
      const decoded = JSON.parse(e.data);

      if (decoded.type === 'NEW_CANVAS') {

        for (let item of decoded.canvas) {
          const context = canvas.current.getContext('2d');
          const imageData = context.createImageData(1, 1);
          const d = imageData.data;

          d[0] = 0;
          d[1] = 0;
          d[2] = 0;
          d[3] = 255;

          context.putImageData(imageData, item.x, item.y);
        }
      }
    };

  }, []);

  const canvas = useRef(null);


  const canvasMouseMoveHandler = event => {
    if (state.mouseDown) {
      const clientX = event.clientX;
      const clientY = event.clientY;
      setState(prevState => {
        return {
          ...prevState,
          pixelsArray: [...prevState.pixelsArray, {
            x: clientX,
            y: clientY
          }]
        };
      });

      const context = canvas.current.getContext('2d');
      const imageData = context.createImageData(1, 1);
      const d = imageData.data;

      d[0] = 0;
      d[1] = 0;
      d[2] = 0;
      d[3] = 255;

      context.putImageData(imageData, event.clientX, event.clientY);
    }
  };

  const mouseDownHandler = event => {
    setState({...state, mouseDown: true});
  };

  const mouseUpHandler = event => {
    ws.current.send(JSON.stringify({type: 'CREATE_CANVAS', canvas: state.pixelsArray}));
    
    setState({...state, mouseDown: false, pixelsArray: []});
  };

  return (
    <div style={{marginBottom: '20px'}}>
      <canvas
        ref={canvas}
        style={{border: '1px solid black'}}
        width={800}
        height={600}
        onMouseDown={mouseDownHandler}
        onMouseUp={mouseUpHandler}
        onMouseMove={canvasMouseMoveHandler}
      />
    </div>
  );
};

export default App;