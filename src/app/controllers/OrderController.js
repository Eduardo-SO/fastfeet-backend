import { isWithinInterval, setHours, startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';
import * as Yup from 'yup';

import User from '../models/User';
import File from '../models/File';
import Delivery from '../models/Delivery';
import Deliveryman from '../models/Deliveryman';

class OrderController {
    async index(req, res) {
        const { id } = req.params;

        const deliveryman = await Deliveryman.findOne({
            where: { id },
        });

        if (!deliveryman) {
            return res.json({ error: 'This deliveryman does not exist' });
        }

        const deliveries = await Delivery.findAll({
            where: { deliveryman_id: id, end_date: null, canceled_at: null },
        });

        return res.json(deliveries);
    }

    async store(req, res) {
        const user = await User.findByPk(req.userId);

        if (!user.provider) {
            return res.json({ error: 'User is not a provider' });
        }

        const currentDate = new Date();
        if (
            !isWithinInterval(currentDate, {
                start: setHours(currentDate, 1),
                end: setHours(currentDate, 18),
            })
        ) {
            return res.json({
                error: 'You can only withdraw orders between 8:00 and 18:00',
            });
        }

        const delivery = await Delivery.findOne({
            where: { id: req.params.id },
        });

        if (!delivery) {
            return res.json({ error: 'This delivery does not exist' });
        }

        if (delivery.start_date) {
            return res.json({ error: 'This delivery has already started' });
        }

        if (delivery.canceled_at) {
            return res.json({ error: 'This delivery has been canceled' });
        }

        const { deliveryman_id } = delivery;

        const todayDeliveries = await Delivery.findAll({
            where: {
                start_date: {
                    [Op.between]: [
                        startOfDay(currentDate),
                        endOfDay(currentDate),
                    ],
                },
                deliveryman_id,
            },
        });

        if (todayDeliveries.length >= 5) {
            return res.json({
                error: 'This deliveryman can only make 5 deliveries per day',
            });
        }

        delivery.start_date = currentDate;
        delivery.save();

        return res.json(delivery);
    }

    async delete(req, res) {
        const schema = Yup.object().shape({
            file: Yup.object().required(),
        });

        if (!(await schema.isValid(req))) {
            return res.json({ error: 'Signature not provided' });
        }

        const user = await User.findByPk(req.userId);

        if (!user.provider) {
            return res.json({ error: 'User is not a provider' });
        }

        const delivery = await Delivery.findOne({
            where: { id: req.params.id },
        });

        if (!delivery) {
            return res.json({ error: 'This delivery does not exist' });
        }

        if (!delivery.start_date) {
            return res.json({ error: "This order hasn't started yet" });
        }

        if (delivery.end_date) {
            return res.json({ error: 'This delivery has already ended' });
        }

        if (delivery.canceled_at) {
            return res.json({ error: 'This delivery has been canceled' });
        }

        const { originalname: name, filename: path } = req.file;

        const file = await File.create({
            name,
            path,
        });

        delivery.end_date = new Date();
        delivery.signature_id = file.id;
        delivery.save();

        return res.json(delivery);
    }
}

export default new OrderController();
