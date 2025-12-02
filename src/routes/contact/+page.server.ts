import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';

const contactSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters').max(100),
	email: z.string().email('Invalid email address'),
	subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
	message: z.string().min(10, 'Message must be at least 10 characters').max(2000)
});

export const load: PageServerLoad = async () => {
	return {
		seoData: {
			title: 'Contact Us - Digital Card Studio',
			description: 'Get in touch with the Digital Card Studio team. We\'re here to help with questions, feedback, or support.',
			url: 'https://digitalcardstudio.com/contact',
			type: 'website'
		}
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name')?.toString();
		const email = formData.get('email')?.toString();
		const subject = formData.get('subject')?.toString();
		const message = formData.get('message')?.toString();

		// Validate input
		const validation = contactSchema.safeParse({ name, email, subject, message });
		if (!validation.success) {
			return fail(400, {
				error: validation.error.errors[0].message,
				name,
				email,
				subject,
				message
			});
		}

		// In a real application, you would:
		// 1. Send email via service like SendGrid, Resend, or AWS SES
		// 2. Store in database for tracking
		// 3. Send to support ticket system
		
		// For now, just log and return success
		console.log('Contact form submission:', validation.data);

		// Simulate email sending
		try {
			// await sendEmail({
			//   to: 'support@digitalcardstudio.com',
			//   from: validation.data.email,
			//   subject: validation.data.subject,
			//   text: `From: ${validation.data.name} (${validation.data.email})\n\n${validation.data.message}`
			// });

			return {
				success: true,
				message: 'Thank you for contacting us! We\'ll get back to you within 24 hours.'
			};
		} catch (error) {
			console.error('Failed to send contact email:', error);
			return fail(500, {
				error: 'Failed to send message. Please try again or email us directly at support@digitalcardstudio.com',
				name,
				email,
				subject,
				message
			});
		}
	}
};
