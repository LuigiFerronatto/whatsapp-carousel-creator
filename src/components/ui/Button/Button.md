# 🔘 Universal Button Component

## 📝 Overview

The Universal Button Component is a highly flexible and customizable React button implementation designed to provide a consistent and powerful UI element across your application.

## ✨ Key Features

- 🎨 Multiple visual variants
- 🌈 Comprehensive color schemes
- 📏 Responsive sizing
- 🚀 Rich interaction states
- 🔗 Versatile rendering options
- ♿ Accessibility considerations

## 🛠 Installation

```bash
npm install @your-package/button
# or
yarn add @your-package/button
```

## 🚀 Usage

### Basic Usage

```jsx
import Button from '@your-package/button';

function MyComponent() {
  return (
    <Button>
      Click Me
    </Button>
  );
}
```

## 🔍 Props API

### Variant Styles

| Prop      | Type     | Options                  | Default   | Description                      |
|-----------|----------|--------------------------|-----------|----------------------------------|
| `variant` | `string` | `'solid'`, `'outline'`, `'text'` | `'solid'` | Visual style of the button       |

#### Examples
```jsx
<Button variant="solid">Solid Button</Button>
<Button variant="outline">Outline Button</Button>
<Button variant="text">Text Button</Button>
```

### Color Schemes

| Prop    | Type     | Options                         | Default    | Description                 |
|---------|----------|----------------------------------|------------|----------------------------|
| `color` | `string` | `'primary'`, `'content'`, `'success'`, `'danger'` | `'primary'` | Color theme of the button  |

#### Examples
```jsx
<Button color="primary">Primary</Button>
<Button color="content">Neutral</Button>
<Button color="success">Success</Button>
<Button color="danger">Danger</Button>
```

### Sizing

| Prop   | Type     | Options                | Default   | Description           |
|--------|----------|------------------------|-----------|----------------------|
| `size` | `string` | `'small'`, `'medium'`, `'large'` | `'medium'` | Button size variations |

#### Examples
```jsx
<Button size="small">Small</Button>
<Button size="medium">Medium</Button>
<Button size="large">Large</Button>
```

### Advanced Props

| Prop         | Type      | Description                                     | Default |
|--------------|-----------|-------------------------------------------------|---------|
| `disabled`   | `boolean` | Disables button interactions                    | `false` |
| `loading`    | `boolean` | Shows loading state                             | `false` |
| `fullWidth`  | `boolean` | Expands button to container width               | `false` |
| `mediumWidth`| `boolean` | Sets button to 50% width                        | `false` |
| `rounded`    | `boolean` | Applies fully rounded corners                   | `false` |
| `iconLeft`   | `ReactNode`| Icon displayed before text                     | `null`  |
| `iconRight`  | `ReactNode`| Icon displayed after text                      | `null`  |

### Component Rendering

| Prop   | Type     | Description                            | Default    |
|--------|----------|----------------------------------------|------------|
| `as`   | `string` | Render button as different component   | `'button'` |
| `href` | `string` | URL for link-like buttons              | -          |
| `target`| `string`| Target attribute for link-like buttons | -          |

## 🎨 Styling Variations

### Icon Buttons
```jsx
<Button iconLeft={<SaveIcon />}>Save</Button>
<Button iconRight={<ArrowRightIcon />}>Next</Button>
```

### Link-like Buttons
```jsx
<Button as="a" href="/dashboard">Dashboard</Button>
<Button as="a" href="https://example.com" target="_blank">
  External Link
</Button>
```

### Width Variations
```jsx
<Button fullWidth>Full Width</Button>
<Button mediumWidth>Medium Width</Button>
```

### Rounded Buttons
```jsx
<Button rounded>Rounded Button</Button>
```

## 💡 Tooltip Integration

```jsx
<Button
  tooltipProps={{
    text: "Additional Information",
    position: "top"
  }}
>
  Hover Me
</Button>
```

## 🎯 Best Practices

- Always provide meaningful text or icons
- Use color and variant to indicate action importance
- Maintain consistency across your application
- Consider accessibility when designing button interactions

## ♿ Accessibility

- Supports disabled and loading states
- Compatible with screen readers
- Keyboard navigable
- Clear visual feedback on interactions

## 🚄 Performance Considerations

- Lightweight component
- Minimal re-renders
- CSS-in-JS optimized styles

## 🔧 Customization

For custom styling, use the `className` prop or extend the base component.

## 📜 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## 💻 Complete Usage Example

```jsx
function ComplexButtonDemo() {
  return (
    <div>
      <Button
        variant="solid"
        color="primary"
        size="large"
        iconLeft={<SaveIcon />}
        fullWidth
        onClick={handleSave}
      >
        Save Changes
      </Button>

      <Button
        variant="outline"
        color="danger"
        size="small"
        disabled
      >
        Cancel
      </Button>

      <Button
        as="a"
        href="/dashboard"
        variant="text"
        color="content"
        iconRight={<ArrowRightIcon />}
      >
        Go to Dashboard
      </Button>
    </div>
  );
}
```

