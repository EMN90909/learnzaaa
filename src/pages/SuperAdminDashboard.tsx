import React from 'react';
import { Card, CardHeader, CardFooter, Badge } from '@/components/ui/card';
import { Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/integrations/supabase/supabaseContext';
import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/integrations/supabase/supabaseContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { CardHeader } from '@/components/ui/card';
import { CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit } from 'lucide-react';
import { Trash2 } from 'lucide-react';

/* ... rest of the component ... */