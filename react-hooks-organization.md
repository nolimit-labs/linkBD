# React Component Hook Organization

A standardized way to organize hooks in React components for better readability and maintainability.

## Hook Organization Order

### 1. Component State (useState, useReducer)
```typescript
// Local component state
const [isOpen, setIsOpen] = useState(false);
const [selectedItems, setSelectedItems] = useState<string[]>([]);
const [formData, setFormData] = useReducer(formReducer, initialFormData);
```

### 2. Router Hooks (useNavigate, useParams, useLocation, etc.)
```typescript
// Router-related hooks
const navigate = useNavigate();
const { id } = useParams();
const location = useLocation();
```

### 3. Authentication & Session
```typescript
// Auth and session hooks
const session = useSession();
const { data: activeOrg } = useActiveOrganization();
```

### 4. Data Fetching (useQuery, useMutation, custom hooks)
```typescript
// Data fetching hooks
const { data: customers, isLoading } = useCustomers();
const { data: vehicles } = useVehicles(customerId);
const createCustomer = useCreateCustomer();
const updateCustomer = useUpdateCustomer();
```

### 5. Side Effects (useEffect, useLayoutEffect)
```typescript
// Side effects
useEffect(() => {
  // Effect logic here
}, [dependency]);

useLayoutEffect(() => {
  // Layout effect logic here
}, []);
```

### 6. Refs (useRef, useImperativeHandle)
```typescript
// Refs
const inputRef = useRef<HTMLInputElement>(null);
const containerRef = useRef<HTMLDivElement>(null);
```

### 7. Context & Other Hooks
```typescript
// Context and other specialized hooks
const theme = useTheme();
const { toast } = useToast();
```

## Complete Example

```typescript
function CustomerManagement() {
  // 1. Component State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // 2. Router Hooks
  const navigate = useNavigate();
  const { customerId } = useParams();
  
  // 3. Authentication & Session
  const session = useSession();
  const { data: activeOrg } = useActiveOrganization();
  
  // 4. Data Fetching
  const { data: customers, isLoading } = useCustomers();
  const { data: customer } = useCustomer(customerId);
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();
  
  // 5. Side Effects
  useEffect(() => {
    if (customerId && customer) {
      setSelectedCustomer(customer);
    }
  }, [customerId, customer]);
  
  // 6. Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // 7. Context & Other Hooks
  const { toast } = useToast();
  
  // Event handlers and component logic...
  
  return (
    // JSX here
  );
}
```

## Benefits

1. **Consistency** - Easy to find specific types of hooks
2. **Readability** - Clear separation of concerns
3. **Maintainability** - Predictable structure across components
4. **Code Reviews** - Easier to spot issues and patterns
5. **Team Collaboration** - Everyone follows the same conventions

## Notes

- Always group related hooks together within each category
- Use descriptive variable names for hook returns
- Add comments for complex hook usage or business logic
- Consider extracting complex hook logic into custom hooks