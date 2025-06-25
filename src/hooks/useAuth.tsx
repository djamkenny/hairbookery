
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAuth = () => {
	const [user, setUser] = useState<any>(null);

	useEffect(() => {
		const checkAuth = async () => {
			const { data: { session } } = await supabase.auth.getSession();
			setUser(session?.user || null);
		};
		checkAuth();

		const { data: { subscription } } = supabase.auth.onAuthStateChange(
			(_event, session) => {
				setUser(session?.user || null);
			}
		);

		return () => subscription.unsubscribe();
	}, []);

	return { user };
};
